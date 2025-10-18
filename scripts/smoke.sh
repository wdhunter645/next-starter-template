#!/bin/bash
# Smoke test script for verifying staging/preview deployments
# Tests critical routes and API endpoints

# Don't exit on first error - we want to run all tests
# set -e removed to allow continuing after failures

# Get base URL from environment or use default
BASE_URL="${SMOKE_URL:-http://localhost:3000}"

echo "🧪 Running smoke tests against: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test a URL
test_url() {
    local url="$1"
    local description="$2"
    
    echo -n "Testing $description... "
    
    # Use curl with timeout and follow redirects
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 10 --max-time 30 "$BASE_URL$url" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($HTTP_CODE)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} ($HTTP_CODE)"
        ((FAILED++))
        return 1
    fi
}

# Test public pages
echo "📄 Testing public pages..."
test_url "/" "Home page"
test_url "/weekly" "Weekly page"
test_url "/milestones" "Milestones page"
test_url "/news" "News page"
test_url "/calendar" "Calendar page"

echo ""
echo "🔌 Testing API endpoints..."

# Test API endpoints
test_url "/api/supabase/status" "Supabase status API"

# Note: These endpoints may not exist yet, so we just try them
# If they return 404, that's expected and we'll create them later
echo -n "Testing Environment check API... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 10 --max-time 30 "$BASE_URL/api/env/check" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($HTTP_CODE)"
    ((PASSED++))
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${YELLOW}⚠ SKIP${NC} (endpoint not implemented yet)"
else
    echo -e "${RED}✗ FAIL${NC} ($HTTP_CODE)"
    ((FAILED++))
fi

echo -n "Testing Phase 2 status API... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 10 --max-time 30 "$BASE_URL/api/phase2/status" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($HTTP_CODE)"
    ((PASSED++))
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${YELLOW}⚠ SKIP${NC} (endpoint not implemented yet)"
else
    echo -e "${RED}✗ FAIL${NC} ($HTTP_CODE)"
    ((FAILED++))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Exit with error if any tests failed
if [ $FAILED -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
fi
