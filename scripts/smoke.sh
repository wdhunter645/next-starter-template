#!/usr/bin/env bash
set -euo pipefail

# smoke.sh
# Smoke test script for key endpoints
# Usage: BASE_URL=https://your-preview.pages.dev bash scripts/smoke.sh
# Or locally: BASE_URL=http://localhost:3000 bash scripts/smoke.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🔍 Running smoke tests against: ${BASE_URL}"
echo ""

# Track failures
FAILED=0
PASSED=0

# Test helper function
test_endpoint() {
  local path="$1"
  local expected_status="${2:-200}"
  local url="${BASE_URL}${path}"
  
  echo -n "Testing ${path} ... "
  
  # Use -s for silent, -w to get status code, -o to discard body
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${url}" || echo "000")
  
  if [[ "${HTTP_CODE}" == "${expected_status}" ]]; then
    echo "✓ ${HTTP_CODE}"
    PASSED=$((PASSED + 1))
  else
    echo "✗ Expected ${expected_status}, got ${HTTP_CODE}"
    FAILED=$((FAILED + 1))
  fi
}

# Public pages (should return 200)
echo "📄 Testing public pages..."
test_endpoint "/" 200
test_endpoint "/weekly" 200
test_endpoint "/milestones" 200
test_endpoint "/charities" 200
test_endpoint "/news" 200
test_endpoint "/calendar" 200
test_endpoint "/social" 200

echo ""

# API endpoints (vary by auth/config status)
echo "🔌 Testing API endpoints..."
echo "Note: These may return 401/403 (unauth) or 503 (not configured)"

# Supabase status endpoint (public, should return 200 with config info)
test_endpoint "/api/supabase/status" 200

# Admin endpoints (should return 401 when not authenticated)
# We don't send auth headers, so we expect 401 or 503
echo -n "Testing /api/admin/b2/presign (POST) ... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/admin/b2/presign" \
  -H "Content-Type: application/json" \
  -d '{"key":"test.txt"}' || echo "000")
if [[ "${HTTP_CODE}" == "401" || "${HTTP_CODE}" == "403" || "${HTTP_CODE}" == "503" ]]; then
  echo "✓ ${HTTP_CODE} (expected auth failure or not configured)"
  PASSED=$((PASSED + 1))
else
  echo "✗ Expected 401/403/503, got ${HTTP_CODE}"
  FAILED=$((FAILED + 1))
fi

echo -n "Testing /api/admin/b2/sync ... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/admin/b2/sync" || echo "000")
if [[ "${HTTP_CODE}" == "401" || "${HTTP_CODE}" == "403" || "${HTTP_CODE}" == "503" ]]; then
  echo "✓ ${HTTP_CODE} (expected auth failure or not configured)"
  PASSED=$((PASSED + 1))
else
  echo "✗ Expected 401/403/503, got ${HTTP_CODE}"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results: ${PASSED} passed, ${FAILED} failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ ${FAILED} -gt 0 ]]; then
  exit 1
fi

exit 0
