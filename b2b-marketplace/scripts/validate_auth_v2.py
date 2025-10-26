#!/usr/bin/env python3
"""
Authentication v2 Validation Script
Tests the new OAuth 2.1 compliant authentication system
"""
import asyncio
import httpx
import json
import uuid
from datetime import datetime
from typing import Dict, Any

# Test configuration
BASE_URL = "http://localhost:8000"
API_PREFIX = "/api/v1"

class AuthV2Validator:
    """Validates the new authentication system"""
    
    def __init__(self):
        self.base_url = f"{BASE_URL}{API_PREFIX}"
        self.device_id = str(uuid.uuid4())
        self.test_phone = "+1234567890"
        self.access_token = None
        self.refresh_token = None
        
    async def run_validation(self):
        """Run complete validation suite"""
        print("🔐 Starting Authentication v2 Validation")
        print("=" * 50)
        
        tests = [
            ("Health Check", self.test_health_check),
            ("OTP Request", self.test_otp_request),
            ("OTP Verification", self.test_otp_verification),
            ("Token Refresh", self.test_token_refresh),
            ("Device Management", self.test_device_management),
            ("Logout", self.test_logout),
            ("Security Features", self.test_security_features),
        ]
        
        results = []
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            try:
                result = await test_func()
                results.append((test_name, "PASS" if result else "FAIL"))
                print(f"✅ {test_name}: {'PASS' if result else 'FAIL'}")
            except Exception as e:
                results.append((test_name, f"ERROR: {str(e)}"))
                print(f"❌ {test_name}: ERROR - {str(e)}")
        
        print("\n" + "=" * 50)
        print("📊 VALIDATION SUMMARY")
        print("=" * 50)
        
        for test_name, result in results:
            status_icon = "✅" if result == "PASS" else "❌"
            print(f"{status_icon} {test_name}: {result}")
        
        passed = sum(1 for _, result in results if result == "PASS")
        total = len(results)
        print(f"\n🎯 Overall: {passed}/{total} tests passed")
        
        return passed == total
    
    async def test_health_check(self) -> bool:
        """Test authentication service health"""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/auth/health")
            if response.status_code == 200:
                data = response.json()
                print(f"   Health status: {data.get('status')}")
                print(f"   Bypass OTP: {data.get('bypass_otp')}")
                print(f"   SMS Provider: {data.get('sms_provider')}")
                return True
        return False
    
    async def test_otp_request(self) -> bool:
        """Test OTP request functionality"""
        async with httpx.AsyncClient() as client:
            payload = {
                "phone": self.test_phone,
                "device_id": self.device_id
            }
            response = await client.post(f"{self.base_url}/auth/request-otp", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   OTP request successful: {data.get('detail')}")
                print(f"   Phone: {data.get('phone')}")
                if 'bypass_code' in data:
                    print(f"   Bypass code: {data.get('bypass_code')}")
                return True
            else:
                print(f"   OTP request failed: {response.status_code} - {response.text}")
                return False
    
    async def test_otp_verification(self) -> bool:
        """Test OTP verification and token creation"""
        async with httpx.AsyncClient() as client:
            # Use bypass code for testing
            payload = {
                "phone": self.test_phone,
                "otp_code": "000000",  # Bypass code
                "device_id": self.device_id,
                "device_type": "mobile",
                "device_name": "Test Device"
            }
            response = await client.post(f"{self.base_url}/auth/verify-otp", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get('access_token')
                self.refresh_token = data.get('refresh_token')
                
                print(f"   OTP verification successful")
                print(f"   Access token: {self.access_token[:20]}...")
                print(f"   Refresh token: {self.refresh_token[:20]}...")
                print(f"   User ID: {data.get('user', {}).get('id')}")
                print(f"   Device ID: {data.get('device', {}).get('id')}")
                return True
            else:
                print(f"   OTP verification failed: {response.status_code} - {response.text}")
                return False
    
    async def test_token_refresh(self) -> bool:
        """Test token refresh with rotation"""
        if not self.refresh_token:
            print("   No refresh token available")
            return False
            
        async with httpx.AsyncClient() as client:
            payload = {
                "refresh_token": self.refresh_token,
                "device_id": self.device_id
            }
            response = await client.post(f"{self.base_url}/auth/refresh", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                old_refresh_token = self.refresh_token
                self.access_token = data.get('access_token')
                self.refresh_token = data.get('refresh_token')
                
                print(f"   Token refresh successful")
                print(f"   New access token: {self.access_token[:20]}...")
                print(f"   New refresh token: {self.refresh_token[:20]}...")
                print(f"   Token rotated: {old_refresh_token != self.refresh_token}")
                return True
            else:
                print(f"   Token refresh failed: {response.status_code} - {response.text}")
                return False
    
    async def test_device_management(self) -> bool:
        """Test device management functionality"""
        if not self.access_token:
            print("   No access token available")
            return False
            
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            # Get user devices
            response = await client.get(f"{self.base_url}/auth/devices?user_id=test-user", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                devices = data.get('devices', [])
                print(f"   Found {len(devices)} devices")
                for device in devices:
                    print(f"   - Device: {device.get('id')} ({device.get('type')})")
                return True
            else:
                print(f"   Device management failed: {response.status_code} - {response.text}")
                return False
    
    async def test_logout(self) -> bool:
        """Test logout functionality"""
        if not self.refresh_token:
            print("   No refresh token available")
            return False
            
        async with httpx.AsyncClient() as client:
            payload = {
                "refresh_token": self.refresh_token,
                "device_id": self.device_id
            }
            response = await client.post(f"{self.base_url}/auth/logout", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Logout successful: {data.get('detail')}")
                return True
            else:
                print(f"   Logout failed: {response.status_code} - {response.text}")
                return False
    
    async def test_security_features(self) -> bool:
        """Test security features"""
        async with httpx.AsyncClient() as client:
            # Test rate limiting
            print("   Testing rate limiting...")
            for i in range(6):  # Exceed rate limit
                payload = {
                    "phone": f"+123456789{i}",
                    "device_id": str(uuid.uuid4())
                }
                response = await client.post(f"{self.base_url}/auth/request-otp", json=payload)
                if i < 5:
                    if response.status_code != 200:
                        print(f"   Rate limiting triggered at request {i+1}")
                        break
                else:
                    if response.status_code == 429:
                        print("   Rate limiting working correctly")
                        return True
            
            # Test invalid OTP
            print("   Testing invalid OTP...")
            payload = {
                "phone": self.test_phone,
                "otp_code": "999999",  # Invalid OTP
                "device_id": self.device_id
            }
            response = await client.post(f"{self.base_url}/auth/verify-otp", json=payload)
            if response.status_code == 400:
                print("   Invalid OTP correctly rejected")
                return True
            
            return False

async def main():
    """Main validation function"""
    validator = AuthV2Validator()
    success = await validator.run_validation()
    
    if success:
        print("\n🎉 All tests passed! Authentication v2 is working correctly.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)


