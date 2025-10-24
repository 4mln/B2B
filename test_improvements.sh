#!/bin/bash

# Test script for verifying production-ready improvements
# This script tests the enhanced error handling, connection management, and logging

set -e  # Exit on error

echo "=========================================="
echo "B2B Marketplace - Improvements Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Function to test endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing: $description... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    
    if [ "$response" = "$expected_status" ]; then
        test_result 0 "$description"
        return 0
    else
        test_result 1 "$description (expected $expected_status, got $response)"
        return 1
    fi
}

# Configuration
BACKEND_URL=${BACKEND_URL:-http://localhost:8000}

echo "Testing backend at: $BACKEND_URL"
echo ""

# Test 1: Health endpoint
echo "=========================================="
echo "Test 1: Health Check Endpoint"
echo "=========================================="
test_endpoint "$BACKEND_URL/health" "200" "Health endpoint availability"

# Test 2: Health endpoint with prefix
echo ""
echo "=========================================="
echo "Test 2: Health Check with API Prefix"
echo "=========================================="
test_endpoint "$BACKEND_URL/api/v1/health" "200" "Health endpoint with API prefix"

# Test 3: Health endpoint response structure
echo ""
echo "=========================================="
echo "Test 3: Health Check Response Structure"
echo "=========================================="
echo -n "Testing health response structure... "
health_response=$(curl -s "$BACKEND_URL/health")

# Check if response contains required fields
if echo "$health_response" | grep -q "status" && \
   echo "$health_response" | grep -q "app_name" && \
   echo "$health_response" | grep -q "version" && \
   echo "$health_response" | grep -q "components"; then
    test_result 0 "Health response has correct structure"
    echo "  Response: $health_response"
else
    test_result 1 "Health response missing required fields"
    echo "  Response: $health_response"
fi

# Test 4: CORS headers
echo ""
echo "=========================================="
echo "Test 4: CORS Configuration"
echo "=========================================="
echo -n "Testing CORS preflight request... "
cors_response=$(curl -s -I -X OPTIONS \
    -H "Origin: http://localhost:19006" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    "$BACKEND_URL/health")

if echo "$cors_response" | grep -qi "access-control-allow"; then
    test_result 0 "CORS headers present"
else
    test_result 1 "CORS headers missing"
fi

# Test 5: API Documentation
echo ""
echo "=========================================="
echo "Test 5: API Documentation"
echo "=========================================="
test_endpoint "$BACKEND_URL/api/docs" "200" "Swagger UI documentation"
test_endpoint "$BACKEND_URL/api/redoc" "200" "ReDoc documentation"

# Test 6: Response time
echo ""
echo "=========================================="
echo "Test 6: Response Time"
echo "=========================================="
echo -n "Testing health endpoint response time... "
start_time=$(date +%s%N)
curl -s "$BACKEND_URL/health" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 1000 ]; then
    test_result 0 "Response time acceptable (${response_time}ms < 1000ms)"
else
    test_result 1 "Response time too high (${response_time}ms >= 1000ms)"
fi

# Test 7: Error handling (404)
echo ""
echo "=========================================="
echo "Test 7: Error Handling"
echo "=========================================="
test_endpoint "$BACKEND_URL/api/v1/nonexistent" "404" "404 error handling"

# Test 8: Detailed health check
echo ""
echo "=========================================="
echo "Test 8: Component Health Status"
echo "=========================================="
echo -n "Testing component health status... "
health_response=$(curl -s "$BACKEND_URL/health")

if echo "$health_response" | grep -q '"database"' && \
   echo "$health_response" | grep -q '"redis"'; then
    test_result 0 "Component health status reported"
    echo "  Database: $(echo $health_response | grep -o '"database":"[^"]*"' | cut -d'"' -f4)"
    echo "  Redis: $(echo $health_response | grep -o '"redis":"[^"]*"' | cut -d'"' -f4)"
else
    test_result 1 "Component health status missing"
fi

# Test 9: Request ID tracking
echo ""
echo "=========================================="
echo "Test 9: Request ID Tracking"
echo "=========================================="
echo -n "Testing request ID in response headers... "
response_headers=$(curl -s -I "$BACKEND_URL/health")

if echo "$response_headers" | grep -qi "x-request-id"; then
    request_id=$(echo "$response_headers" | grep -i "x-request-id" | cut -d' ' -f2 | tr -d '\r')
    test_result 0 "Request ID tracking enabled"
    echo "  Request ID: $request_id"
else
    test_result 1 "Request ID header missing"
fi

# Test 10: Backend files verification
echo ""
echo "=========================================="
echo "Test 10: File Structure Verification"
echo "=========================================="

check_file() {
    if [ -f "$1" ]; then
        test_result 0 "File exists: $1"
    else
        test_result 1 "File missing: $1"
    fi
}

check_file "b2b-marketplace/.env.example"
check_file "b2b-marketplace/app/main.py"
check_file "b2b-marketplace/app/core/logging.py"
check_file "frontend-mobile/.env.example"
check_file "frontend-mobile/src/components/ErrorBoundary.tsx"
check_file "frontend-mobile/src/utils/backendTest.ts"
check_file "PRODUCTION_READINESS_REPORT.md"
check_file "QUICK_START_GUIDE.md"

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    echo ""
    echo "Your B2B Marketplace is production-ready!"
    echo "Next steps:"
    echo "  1. Review PRODUCTION_READINESS_REPORT.md"
    echo "  2. Configure production environment variables"
    echo "  3. Set up monitoring and alerting"
    echo "  4. Perform load testing"
    exit 0
else
    echo -e "${RED}Some tests failed. ✗${NC}"
    echo ""
    echo "Please review the failed tests and ensure:"
    echo "  1. Backend is running (docker-compose up -d)"
    echo "  2. Database is accessible"
    echo "  3. Redis is running"
    echo "  4. All environment variables are set"
    exit 1
fi
