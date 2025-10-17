#!/bin/bash
# Smoke Tests for next-starter-template
# Tests critical endpoints to verify deployment health
#
# Usage:
#   BASE_URL=https://your-preview-url.com bash scripts/smoke.sh
#   BASE_URL=http://localhost:3000 bash scripts/smoke.sh

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
FAILED=0
PASSED=0

echo "Running smoke tests against: $BASE_URL"
echo "=================================================="

# Helper function to test an endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local expected_status=$3
    local description=$4
    
    printf "Testing %-40s ... " "$description"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path" || echo "000")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d '{}' \
            "$BASE_URL$path" || echo "000")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo "✓ PASS ($response)"
        PASSED=$((PASSED + 1))
    else
        echo "✗ FAIL (expected $expected_status, got $response)"
        FAILED=$((FAILED + 1))
    fi
}

# Public Pages (should return 200)
echo ""
echo "Public Pages:"
echo "--------------------------------------------------"
test_endpoint "GET" "/" "200" "Home page"
test_endpoint "GET" "/weekly" "200" "Weekly page"
test_endpoint "GET" "/milestones" "200" "Milestones page"
test_endpoint "GET" "/charities" "200" "Charities page"
test_endpoint "GET" "/news" "200" "News page"
test_endpoint "GET" "/calendar" "200" "Calendar page"

# API Endpoints (should return 200)
echo ""
echo "API Status Endpoints:"
echo "--------------------------------------------------"
test_endpoint "GET" "/api/env/check" "200" "/api/env/check"
test_endpoint "GET" "/api/phase2/status" "200" "/api/phase2/status"

# Summary
echo ""
echo "=================================================="
echo "Test Results:"
echo "  Passed: $PASSED"
echo "  Failed: $FAILED"
echo "=================================================="

if [ $FAILED -gt 0 ]; then
    echo "❌ Some tests failed"
    exit 1
else
    echo "✅ All smoke tests passed!"
    exit 0
fi
