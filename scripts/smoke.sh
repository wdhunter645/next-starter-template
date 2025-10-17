#!/usr/bin/env bash
# Smoke test script - curls key endpoints and verifies they return 200
# Usage: BASE_URL=https://example.com bash scripts/smoke.sh

set -e

# Default to localhost if not specified
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🔍 Running smoke tests against: $BASE_URL"
echo ""

# Track failures
FAILURES=0

# Function to test an endpoint
test_endpoint() {
  local path="$1"
  local url="${BASE_URL}${path}"
  
  echo -n "Testing ${path}... "
  
  if response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null); then
    if [ "$response" = "200" ]; then
      echo "✅ $response"
    else
      echo "❌ $response (expected 200)"
      FAILURES=$((FAILURES + 1))
    fi
  else
    echo "❌ Connection failed"
    FAILURES=$((FAILURES + 1))
  fi
}

# Test public pages
echo "📄 Testing public pages..."
test_endpoint "/"
test_endpoint "/weekly"
test_endpoint "/milestones"
test_endpoint "/charities"
test_endpoint "/news"
test_endpoint "/calendar"

echo ""
echo "🔌 Testing API endpoints..."
test_endpoint "/api/env/check"
test_endpoint "/api/phase2/status"

echo ""
if [ $FAILURES -eq 0 ]; then
  echo "✅ All smoke tests passed!"
  exit 0
else
  echo "❌ $FAILURES test(s) failed"
  exit 1
fi
