# Quick Start Guide - B2B Marketplace

This guide will help you quickly set up and verify the enhanced production-ready B2B Marketplace.

---

## Prerequisites

- **Backend**: Python 3.11+, PostgreSQL 13+, Redis 6+
- **Frontend**: Node.js 18+, npm/yarn, Expo CLI
- **Docker** (optional but recommended)

---

## Backend Setup

### 1. Environment Configuration

```bash
cd b2b-marketplace

# Copy and configure environment variables
cp .env.example .env

# Edit .env and set:
# - SECRET_KEY (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
# - DATABASE_URL (if not using Docker defaults)
# - REDIS_URL (if not using Docker defaults)
```

### 2. Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Check services are running
docker-compose ps

# View logs
docker-compose logs -f app
```

### 3. Manual Setup (Without Docker)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Verify Backend

```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected output:
# {
#   "status": "healthy",
#   "app_name": "B2B Marketplace",
#   "version": "2.1.0",
#   "components": {
#     "database": "healthy",
#     "redis": "healthy"
#   }
# }

# View API documentation
# Open: http://localhost:8000/api/docs
```

---

## Frontend Setup

### 1. Environment Configuration

```bash
cd frontend-mobile

# Copy and configure environment variables
cp .env.example .env

# Edit .env and set:
# - EXPO_PUBLIC_API_URL (default: http://localhost:8000)
# - EXPO_PUBLIC_API_PREFIX (default: /api/v1)
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Start Development Server

```bash
# Start Expo development server
npm start
# or
expo start

# Options:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Press 'w' for web browser
# - Scan QR code with Expo Go app on physical device
```

### 4. Test on Physical Device

```bash
# If testing on physical device on same network, update .env:
# EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8000

# Find your IP:
# Mac/Linux: ifconfig | grep "inet "
# Windows: ipconfig
```

---

## Verification Checklist

### Backend Tests

```bash
cd b2b-marketplace

# Test health endpoint
curl http://localhost:8000/health

# Test with component details
curl -v http://localhost:8000/health | jq

# Test CORS (from different origin)
curl -H "Origin: http://localhost:19006" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8000/health

# Check API documentation
curl http://localhost:8000/api/docs
```

### Frontend Tests

1. **Connection Test**
   - Open the app
   - Check if backend status shows "Connected" (green indicator)
   - If it shows "Disconnected", check the detailed status

2. **Error Boundary Test**
   - Navigate through different screens
   - If any error occurs, you should see a user-friendly error page
   - "Try Again" button should reload the component

3. **Network Resilience Test**
   - Turn off WiFi
   - Try to make an API call
   - Should see network error message
   - Turn WiFi back on
   - Retry should work automatically

4. **Token Refresh Test**
   - Log in to the app
   - Wait for token to expire (or modify expiry time)
   - Make an API call
   - Should automatically refresh token

---

## Common Issues & Solutions

### Backend Issues

#### Issue: "SECRET_KEY must be set"
```bash
# Generate a secure key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Add to .env
SECRET_KEY=<generated_key>
```

#### Issue: "Database connection failed"
```bash
# Check PostgreSQL is running
docker-compose ps db

# Check connection string in .env
# Format: postgresql+asyncpg://user:password@host:port/database

# Test connection manually
psql postgresql://postgres:postgres@localhost:5432/marketplace
```

#### Issue: "Redis connection failed"
```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping
# Should return: PONG
```

#### Issue: "Port 8000 already in use"
```bash
# Find process using port
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
uvicorn app.main:app --reload --port 8001
```

### Frontend Issues

#### Issue: "Backend connection lost"
```bash
# Check backend is actually running
curl http://localhost:8000/health

# Check CORS configuration in backend .env
TRUSTED_ORIGINS=http://localhost:19006,http://localhost:19000

# For physical device, use computer's IP
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

#### Issue: "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
expo start -c
```

#### Issue: "Fonts not loading"
```bash
# Fonts are bundled, but if issues persist:
expo install expo-font

# Restart Expo
expo start -c
```

#### Issue: "Network request failed"
```bash
# For iOS simulator, localhost works
# For Android emulator, use 10.0.2.2 instead of localhost
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# For physical device, use computer's IP
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

---

## Development Tips

### Backend Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest tests/ -v

# View logs
tail -f logs/app.log  # if logging to file

# Interactive Python shell
python -m app.db.session  # Access database models
```

### Frontend Development

```bash
# Clear cache
expo start -c

# Run on specific platform
expo start --ios
expo start --android
expo start --web

# View logs
expo logs
```

### Database Management

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history
```

---

## Monitoring in Development

### Backend Monitoring

1. **Health Check Dashboard**
   ```bash
   # Continuously monitor health
   watch -n 5 'curl -s http://localhost:8000/health | jq'
   ```

2. **Log Monitoring**
   ```bash
   # Follow application logs
   docker-compose logs -f app
   
   # Filter specific logs
   docker-compose logs -f app | grep ERROR
   ```

3. **Database Monitoring**
   ```bash
   # Connect to database
   docker-compose exec db psql -U postgres marketplace
   
   # View active connections
   SELECT * FROM pg_stat_activity;
   ```

### Frontend Monitoring

1. **React DevTools** - Install browser extension
2. **Network Tab** - Monitor API calls in browser
3. **Expo DevTools** - Press 'm' in Expo CLI
4. **React Native Debugger** - Standalone debugging tool

---

## Next Steps

### For Development
1. ✅ Set up local environment
2. ✅ Verify backend and frontend connection
3. Start developing features
4. Write tests
5. Use git branches for feature development

### For Production
1. Review `PRODUCTION_READINESS_REPORT.md`
2. Complete security checklist
3. Set up production infrastructure
4. Configure monitoring and alerting
5. Perform load testing
6. Deploy to staging environment
7. Conduct user acceptance testing
8. Deploy to production

---

## Getting Help

### Documentation
- Backend API Docs: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- Production Guide: `/PRODUCTION_READINESS_REPORT.md`
- Setup Guide: `/b2b-marketplace/SETUP.md`

### Community
- Check existing issues in the repository
- Review code comments for inline documentation
- Consult team members for domain-specific questions

---

## Summary

Your B2B Marketplace is now enhanced with:

✅ **Robust error handling** with automatic retry  
✅ **Production-grade logging** and monitoring  
✅ **Reliable connection management**  
✅ **Comprehensive security measures**  
✅ **Developer-friendly setup**  

**Time to first run**: ~15 minutes (with Docker)  
**Time to first feature**: ~30 minutes (after setup)

---

**Happy Coding! 🚀**

For production deployment, refer to `PRODUCTION_READINESS_REPORT.md`
