#!/usr/bin/env bash
# Smoke test script for verifying key endpoints
# Usage: ./scripts/smoke.sh [BASE_URL]
# Example: ./scripts/smoke.sh https://your-site.pages.dev

set -e

BASE_URL="${1:-http://localhost:3000}"

echo "🧪 Running smoke tests against: $BASE_URL"
echo ""

# Track failures
FAILED=0
TOTAL=0

# Helper function to test an endpoint
test_endpoint() {
    local path="$1"
    local expected_status="${2:-200}"
    local description="${3:-$path}"
    
    TOTAL=$((TOTAL + 1))
    
    echo -n "Testing $description... "
    
    # Make request and capture status code
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path" || echo "000")
    
    if [ "$HTTP_CODE" = "$expected_status" ]; then
        echo "✅ ($HTTP_CODE)"
    else
        echo "❌ (expected $expected_status, got $HTTP_CODE)"
        FAILED=$((FAILED + 1))
    fi
}

echo "📄 Public Pages:"
test_endpoint "/" "200" "Home page"
test_endpoint "/weekly" "200" "Weekly Matchup"
test_endpoint "/milestones" "200" "Milestones"
test_endpoint "/charities" "200" "Charities"
test_endpoint "/news" "200" "News & Q&A"
test_endpoint "/calendar" "200" "Calendar"
test_endpoint "/member" "200" "Join/Member"
test_endpoint "/privacy" "200" "Privacy Policy"
test_endpoint "/terms" "200" "Terms of Service"

echo ""
echo "🔌 API Endpoints:"
test_endpoint "/api/supabase/status" "200" "Supabase Status"

echo ""
echo "🔒 Admin Endpoints (expect 401/403/405/503 when not authenticated):"
# Admin endpoints should return:
# - 401 (unauthorized)
# - 403 (forbidden)
# - 405 (method not allowed - correct for POST-only endpoints hit with GET)
# - 503 (service not configured)
# NOT 500 (server error)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/admin/b2/presign" || echo "000")
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "503" ]; then
    echo "Testing /api/admin/b2/presign (POST)... ✅ ($HTTP_CODE - properly gated)"
    TOTAL=$((TOTAL + 1))
else
    echo "Testing /api/admin/b2/presign (POST)... ❌ (expected 401/403/503, got $HTTP_CODE)"
    FAILED=$((FAILED + 1))
    TOTAL=$((TOTAL + 1))
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/b2/sync" || echo "000")
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "503" ]; then
    echo "Testing /api/admin/b2/sync (GET)... ✅ ($HTTP_CODE - properly gated)"
    TOTAL=$((TOTAL + 1))
else
    echo "Testing /api/admin/b2/sync (GET)... ❌ (expected 401/403/503, got $HTTP_CODE)"
    FAILED=$((FAILED + 1))
    TOTAL=$((TOTAL + 1))
fi

echo ""
echo "📊 Results: $((TOTAL - FAILED))/$TOTAL passed"

if [ $FAILED -gt 0 ]; then
    echo "❌ $FAILED test(s) failed"
    exit 1
else
    echo "✅ All tests passed!"
    exit 0
fi
