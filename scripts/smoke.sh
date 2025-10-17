#!/bin/bash
#
# Smoke Test Script
# Quick validation of API endpoints and core functionality
#
# Usage:
#   ./scripts/smoke.sh [BASE_URL]
#
# Examples:
#   ./scripts/smoke.sh http://localhost:3000
#   ./scripts/smoke.sh https://preview-pr-123.pages.dev
#   ./scripts/smoke.sh https://lougehrigfanclub.com
#

set -e

# Default to localhost if no URL provided
BASE_URL="${1:-http://localhost:3000}"

echo "🔍 Running smoke tests against: $BASE_URL"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local endpoint=$1
  local expected_status=${2:-200}
  local description=$3
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  echo -n "Testing: $description..."
  
  # Make request and capture status code
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" || echo "000")
  
  if [ "$HTTP_CODE" = "$expected_status" ]; then
    echo -e " ${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e " ${RED}✗ FAIL${NC} (Expected $expected_status, got $HTTP_CODE)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Test JSON response
test_json_endpoint() {
  local endpoint=$1
  local description=$2
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  echo -n "Testing: $description..."
  
  # Make request and capture response
  RESPONSE=$(curl -s "$BASE_URL$endpoint" || echo "{}")
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    # Check if response is valid JSON
    if echo "$RESPONSE" | jq empty 2>/dev/null; then
      echo -e " ${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE, valid JSON)"
      TESTS_PASSED=$((TESTS_PASSED + 1))
      
      # Pretty print response (first 3 lines)
      echo "$RESPONSE" | jq -C '.' | head -3
    else
      echo -e " ${YELLOW}⚠ WARN${NC} (HTTP $HTTP_CODE, invalid JSON)"
      TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
  else
    echo -e " ${RED}✗ FAIL${NC} (HTTP $HTTP_CODE)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

echo "═══════════════════════════════════════"
echo "  API Endpoints"
echo "═══════════════════════════════════════"

# Test env check endpoint
test_json_endpoint "/api/env/check" "Environment variable check"

# Test phase2 status endpoint
test_json_endpoint "/api/phase2/status" "Phase 2 status"

echo ""
echo "═══════════════════════════════════════"
echo "  Public Routes"
echo "═══════════════════════════════════════"

# Test public routes
test_endpoint "/" 200 "Home page"
test_endpoint "/weekly" 200 "Weekly page"
test_endpoint "/milestones" 200 "Milestones page"
test_endpoint "/charities" 200 "Charities page"
test_endpoint "/news" 200 "News page"
test_endpoint "/calendar" 200 "Calendar page"
test_endpoint "/privacy" 200 "Privacy page"
test_endpoint "/terms" 200 "Terms page"

echo ""
echo "═══════════════════════════════════════"
echo "  Protected Routes"
echo "═══════════════════════════════════════"

# Test protected routes (should return 200 but show auth required message)
test_endpoint "/member" 200 "Member page (shows auth required)"
test_endpoint "/admin" 200 "Admin page (shows auth required)"

echo ""
echo "═══════════════════════════════════════"
echo "  Summary"
echo "═══════════════════════════════════════"
echo "Tests run:    $TESTS_RUN"
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All smoke tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some smoke tests failed${NC}"
  exit 1
fi
