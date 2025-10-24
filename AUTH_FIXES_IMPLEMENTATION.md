# Authentication Fixes Implementation Guide

**Date**: 2025-10-24  
**Status**: ✅ READY TO IMPLEMENT

---

## Files Created

### 1. ✅ `/workspace/b2b-marketplace/app/core/rate_limit.py`
**Purpose**: Production-grade rate limiting module

**Features**:
- ✅ Redis-based distributed rate limiting
- ✅ Account lockout after failed attempts
- ✅ Customizable limits per action
- ✅ Graceful degradation if Redis unavailable
- ✅ IP-based rate limiting
- ✅ Failed attempt tracking

**Usage**:
```python
from app.core.rate_limit import rate_limit_otp_request

@router.post("/otp/request")
async def otp_request(payload: OTPRequest):
    # Rate limit: 3 requests per hour
    await rate_limit_otp_request(payload.phone)
    # ... rest of logic
```

---

## Critical Fixes Required

### Fix 1: OTP User Creation (CRITICAL)

**File**: `plugins/auth/routes.py:606-614`

**Current (VULNERABLE)**:
```python
user = User(
    username=payload.phone,
    email=f"{payload.phone}@otp.local",
    phone=payload.phone,
    hashed_password="",  # ❌ DANGEROUS!
)
```

**Fixed**:
```python
from plugins.user.security import get_password_hash
import secrets

# Generate secure random password for OTP users
random_password = secrets.token_urlsafe(32)
hashed_password = get_password_hash(random_password)

user = User(
    username=payload.phone,
    email=f"{payload.phone}@otp.local",
    phone=payload.phone,
    hashed_password=hashed_password,  # ✅ Secure
    auth_method="otp",  # Mark as OTP-only user
    kyc_status="pending"
)
```

---

### Fix 2: Add Rate Limiting to OTP Request

**File**: `plugins/auth/routes.py:596`

**Add**:
```python
from app.core.rate_limit import rate_limit_otp_request, check_account_lockout

@router.post("/otp/request", operation_id="otp_request")
async def otp_request(payload: OTPRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # Check account lockout
    await check_account_lockout(payload.phone, "otp")
    
    # Rate limit: 3 requests per hour
    await rate_limit_otp_request(payload.phone)
    
    # IP-based rate limiting (100 per minute)
    if request.client:
        from app.core.rate_limit import rate_limit_by_ip
        await rate_limit_by_ip(request.client.host, "otp_request")
    
    # ... rest of logic
```

---

### Fix 3: Remove OTP from Logs

**File**: `plugins/auth/routes.py:638`

**Current (SECURITY RISK)**:
```python
print(f"[OTP:FALLBACK] {code} to {payload.phone}")
```

**Fixed**:
```python
import logging
logger = logging.getLogger(__name__)

# Use proper logging without exposing OTP
logger.info(f"OTP sent to phone ending in ...{payload.phone[-4:]}")
```

---

### Fix 4: OTP Verify Returns Refresh Token

**File**: `plugins/auth/routes.py:647-669`

**Current (INCOMPLETE)**:
```python
access_token = create_access_token(
    data={"sub": user.email},
    expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
)
return {"access_token": access_token, "token_type": "bearer"}
```

**Fixed**:
```python
from app.core.rate_limit import rate_limit_otp_verify, clear_failed_attempts, record_failed_attempt
from plugins.auth.jwt import create_token_pair

@router.post("/otp/verify", operation_id="otp_verify")
async def otp_verify(payload: OTPVerify, request: Request, db: AsyncSession = Depends(get_db)):
    # Rate limit verification attempts
    await rate_limit_otp_verify(payload.phone)
    
    # Check account lockout
    await check_account_lockout(payload.phone, "otp_verify")
    
    result = await db.execute(select(User).where(User.phone == payload.phone))
    user = result.scalars().first()
    
    if not user or not user.otp_code or not user.otp_expiry:
        await record_failed_attempt(payload.phone, "otp_verify")
        raise HTTPException(status_code=400, detail="OTP not requested")
    
    if user.otp_code != payload.code or datetime.utcnow() > user.otp_expiry:
        await record_failed_attempt(payload.phone, "otp_verify")
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Clear failed attempts on success
    await clear_failed_attempts(payload.phone, "otp_verify")
    
    # Clear OTP and mark as verified
    user.otp_code = None
    user.otp_expiry = None
    user.kyc_status = "otp_verified"
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Create session record
    session = UserSession(
        user_id=user.id,
        new_user_id=user.id if hasattr(user, 'id') and str(user.id).startswith('USR-') else None,
        user_agent=request.headers.get("user-agent", "unknown") if request else "unknown",
        ip_address=request.client.host if request and request.client else None,
        device_id=request.headers.get("x-device-id"),  # Client should send device ID
    )
    db.add(session)
    await db.commit()
    
    # Generate both access and refresh tokens
    tokens = create_token_pair({"sub": user.email})
    
    # Store refresh JTI in Redis
    try:
        redis = await get_redis()
        if redis:
            payload = verify_token(tokens["refresh_token"], HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"))
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                ttl = int(exp - datetime.utcnow().timestamp())
                if ttl > 0:
                    await store_refresh_jti(redis, jti, user.email, ttl)
    except Exception as e:
        logger.error(f"Failed to store refresh JTI: {e}")
    
    # Return consistent response format
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        expires_in=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    )
```

---

### Fix 5: Consolidate Refresh Endpoints

**File**: `plugins/auth/routes.py`

**Remove duplicate `/refresh` endpoint at line 177**

**Keep only `/auth/refresh` endpoint at line 230**

**Add deprecation notice**:
```python
@router.post("/refresh", response_model=TokenResponse, deprecated=True)
async def plugin_refresh_token_deprecated(refresh: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """
    DEPRECATED: Use /auth/refresh instead
    This endpoint will be removed in v3.0
    """
    return await auth_refresh_endpoint(refresh, db)
```

---

### Fix 6: Add Rate Limiting to Login

**File**: `plugins/auth/routes.py:115`

**Add**:
```python
from app.core.rate_limit import rate_limit_login, check_account_lockout, clear_failed_attempts, record_failed_attempt

@router.post("/token", operation_id="login_for_access_token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
):
    # Check account lockout
    await check_account_lockout(form_data.username, "login")
    
    # Rate limit login attempts
    await rate_limit_login(form_data.username)
    
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Record failed attempt
        await record_failed_attempt(form_data.username, "login")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    # Clear failed attempts on success
    await clear_failed_attempts(form_data.username, "login")
    
    # ... rest of logic (capture device info)
    session = UserSession(
        user_id=user.id,
        new_user_id=user.id if hasattr(user, 'id') and str(user.id).startswith('USR-') else None,
        user_agent=request.headers.get("user-agent", "unknown") if request else "unknown",
        ip_address=request.client.host if request and request.client else None,
        device_id=request.headers.get("x-device-id"),
    )
    # ... rest of logic
```

---

### Fix 7: Add Rate Limiting to Token Refresh

**File**: `plugins/auth/routes.py:230`

**Add**:
```python
from app.core.rate_limit import rate_limit_token_refresh

@router.post("/auth/refresh", response_model=TokenResponse, operation_id="auth_refresh")
async def auth_refresh_endpoint(refresh: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = verify_token(refresh.refresh_token, HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if not payload.get("refresh"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_sub = payload.get("sub")
    if not user_sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    # Rate limit refresh requests
    await rate_limit_token_refresh(user_sub)
    
    # ... rest of logic
```

---

### Fix 8: Replace Raw SQL with ORM

**File**: `app/core/auth.py:40-54`

**Current (RAW SQL)**:
```python
result = await db.execute(
    "SELECT * FROM users_new WHERE unique_id = :user_id AND is_active = true",
    {"user_id": user_id}
)
```

**Fixed (ORM)**:
```python
from sqlalchemy import select
from app.models.user import User

result = await db.execute(
    select(User).where(
        User.email == user_id,
        User.is_active == True
    )
)
user = result.scalars().first()

if not user:
    raise credentials_exception
```

---

### Fix 9: Reduce Token Expiry Times

**File**: `app/core/config.py`

**Current**:
```python
ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes
REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days
```

**Recommended (Industry Standard)**:
```python
ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes (industry standard)
REFRESH_TOKEN_EXPIRE_DAYS: int = 1  # 24 hours (more secure)
```

**Note**: If this is too aggressive for your use case, at least use:
```python
ACCESS_TOKEN_EXPIRE_MINUTES: int = 20  # 20 minutes
REFRESH_TOKEN_EXPIRE_DAYS: int = 3  # 3 days
```

---

### Fix 10: Frontend - Remove Duplicate Auth Stores

**Files to Remove**:
- `frontend-mobile/src/features/auth/store.new.ts` ❌
- `frontend-mobile/src/features/auth/store.tmp.ts` ❌

**Keep Only**:
- `frontend-mobile/src/features/auth/store.ts` ✅

**Action**: Delete unused files

---

### Fix 11: Frontend - Fix Refresh Endpoint

**File**: `frontend-mobile/src/services/api.ts:61`

**Current**:
```typescript
const refreshUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth/refresh`;
```

**Verify this matches backend**: `/auth/refresh` or `/api/v1/auth/refresh`

**If backend uses `/api/v1/auth/refresh`**:
```typescript
const refreshUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth/refresh`;
```

**Make sure API_PREFIX = "/api/v1"** in config

---

### Fix 12: Frontend - Add Token Pre-validation

**File**: `frontend-mobile/src/services/api.ts`

**Add before request interceptor**:
```typescript
import { jwtDecode } from 'jwt-decode';

function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000;
    // Check if token expires in less than 5 minutes
    return decoded.exp < (now + 300);
  } catch {
    return true;
  }
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        // Check if token is expired or expiring soon
        if (isTokenExpired(token)) {
          // Try to refresh proactively
          const refreshToken = await SecureStore.getItemAsync('refresh_token');
          if (refreshToken) {
            try {
              const response = await axios.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth/refresh`,
                { refresh_token: refreshToken },
                { timeout: 10000 }
              );
              
              const { access_token, refresh_token: newRefreshToken } = response.data;
              await SecureStore.setItemAsync('auth_token', access_token);
              if (newRefreshToken) {
                await SecureStore.setItemAsync('refresh_token', newRefreshToken);
              }
              
              // Use new token
              if (config.headers) {
                config.headers.Authorization = `Bearer ${access_token}`;
              }
              return config;
            } catch (refreshError) {
              // Refresh failed, will let request proceed with old token
              console.error('Proactive refresh failed:', refreshError);
            }
          }
        }
        
        // Add token to headers
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## Implementation Steps

### Phase 1: Backend Critical Fixes (Days 1-3)
1. ✅ Create `app/core/rate_limit.py`
2. Fix OTP user creation with secure password
3. Add rate limiting to all auth endpoints
4. Remove OTP codes from logs
5. Fix OTP verify to return refresh token
6. Test all changes

### Phase 2: Backend Improvements (Days 4-5)
7. Replace raw SQL with ORM in auth.py
8. Consolidate refresh endpoints
9. Improve session tracking
10. Test all changes

### Phase 3: Frontend Fixes (Days 6-7)
11. Remove duplicate auth store files
12. Fix refresh endpoint paths
13. Add token pre-validation
14. Test all changes

### Phase 4: Testing & Documentation (Days 8-9)
15. Write unit tests
16. Write integration tests
17. Update API documentation
18. Create migration guide

### Phase 5: Deployment (Day 10)
19. Deploy to staging
20. Run security tests
21. Deploy to production
22. Monitor metrics

---

## Testing Checklist

### Backend Tests
```bash
# Rate limiting
pytest tests/test_rate_limit.py

# OTP flow
pytest tests/test_auth_otp_fixed.py

# Token management
pytest tests/test_token_refresh.py

# Account lockout
pytest tests/test_account_lockout.py
```

### Frontend Tests
```bash
# Auth store
npm test -- auth/store.test.ts

# Token refresh
npm test -- services/api.test.ts

# Integration
npm run test:e2e -- --grep "auth"
```

### Manual Testing
1. OTP request (verify rate limiting)
2. OTP verify (verify returns both tokens)
3. Token refresh (verify works)
4. Failed login 5 times (verify lockout)
5. Session tracking (verify device info captured)

---

## Security Verification

### Pre-deployment Checklist
- [ ] OTP users have secure passwords
- [ ] No OTP codes in logs
- [ ] Rate limiting working on all endpoints
- [ ] Account lockout after 5 failed attempts
- [ ] Refresh tokens properly rotated
- [ ] Device info captured in sessions
- [ ] Token expiry times acceptable
- [ ] All duplicate code removed
- [ ] Tests passing
- [ ] Documentation updated

---

## Rollback Plan

If issues arise:
1. Keep old auth routes as `/auth/legacy/*`
2. Feature flag new auth system
3. Can switch back instantly
4. Database migrations are backward compatible

---

## Success Metrics

### Security
- ✅ Zero critical vulnerabilities
- ✅ Pass security audit
- ✅ Rate limiting prevents abuse
- ✅ Account lockout prevents brute force

### Reliability
- ✅ Token refresh success rate > 99%
- ✅ OTP delivery rate > 95%
- ✅ Login success rate > 98%
- ✅ No user-reported auth issues

### Performance
- ✅ Login time < 2s
- ✅ Token refresh < 500ms
- ✅ OTP delivery < 10s
- ✅ Rate limit check < 50ms

---

**Implementation Ready**: YES  
**Estimated Effort**: 10 days  
**Risk Level**: LOW (with proper testing)  
**Priority**: HIGH (Critical security fixes)  

---

Let me know when you're ready to proceed with implementation!

