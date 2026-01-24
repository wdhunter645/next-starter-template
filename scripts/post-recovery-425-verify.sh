#!/bin/bash
# Post-Recovery Verification Script for PR #425
# Purpose: Confirm REPO31 recovery integrity (read-only checks)
# Usage: ./scripts/post-recovery-425-verify.sh [BASE_URL]
#   BASE_URL: Optional preview URL (e.g., https://preview.pages.dev)

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS_COUNT=0
FAIL_COUNT=0
CHECK_COUNT=0

# Base URL from argument (optional)
BASE_URL="${1:-}"

echo "========================================"
echo "Post-Recovery Verification Script"
echo "PR #425 - REPO31 Recovery Integrity"
echo "========================================"
echo ""
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Commit SHA: $(git rev-parse HEAD)"
echo "Base URL: ${BASE_URL:-"Not provided (skipping endpoint checks)"}"
echo ""

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found in current directory"
  echo "Please run this script from the repository root"
  exit 1
fi

# Helper functions
check_pass() {
  local check_name="$1"
  CHECK_COUNT=$((CHECK_COUNT + 1))
  PASS_COUNT=$((PASS_COUNT + 1))
  echo -e "${GREEN}✓ PASS${NC}: $check_name"
}

check_fail() {
  local check_name="$1"
  local details="${2:-}"
  CHECK_COUNT=$((CHECK_COUNT + 1))
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo -e "${RED}✗ FAIL${NC}: $check_name"
  if [ -n "$details" ]; then
    echo -e "  ${RED}Details: $details${NC}"
  fi
}

check_info() {
  local message="$1"
  echo -e "${YELLOW}ℹ INFO${NC}: $message"
}

# ========================================
# A) REPO HYGIENE CHECKS
# ========================================
echo "----------------------------------------"
echo "A) Repository Hygiene Checks"
echo "----------------------------------------"

# Check for tracked ZIP files
echo "Checking for tracked ZIP files..."
ZIP_FILES=$(git ls-files | grep -i '\.zip$' || true)
if [ -z "$ZIP_FILES" ]; then
  check_pass "No tracked ZIP files found"
else
  check_fail "Tracked ZIP files found" "$ZIP_FILES"
fi

# Report git status
echo ""
echo "Git status (porcelain):"
GIT_STATUS=$(git status --porcelain)
if [ -z "$GIT_STATUS" ]; then
  check_info "Working directory clean"
else
  check_info "Working directory has changes:"
  echo "$GIT_STATUS"
fi

echo ""

# ========================================
# B) BUILD CHECKS
# ========================================
echo "----------------------------------------"
echo "B) Build Checks"
echo "----------------------------------------"

# Run npm ci (or skip if node_modules exists and is recent)
echo "Running: npm ci"
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
  # Check if node_modules is newer than package-lock.json
  if [ "node_modules" -nt "package-lock.json" ]; then
    check_info "node_modules exists and is up-to-date, running npm ci anyway for verification"
  fi
fi

if npm ci > /tmp/npm-ci.log 2>&1; then
  check_pass "npm ci completed successfully"
else
  check_fail "npm ci failed" "See /tmp/npm-ci.log for details"
  echo "Last 20 lines of npm-ci.log:"
  tail -20 /tmp/npm-ci.log || true
fi

echo ""

# Run npm run build
echo "Running: npm run build"
if npm run build > /tmp/npm-build.log 2>&1; then
  check_pass "npm run build completed successfully"
else
  check_fail "npm run build failed" "See /tmp/npm-build.log for details"
  echo "Last 20 lines of npm-build.log:"
  tail -20 /tmp/npm-build.log || true
fi

echo ""

# Check if build:cf exists and run it
if grep -q '"build:cf"' package.json; then
  echo "Running: npm run build:cf"
  if npm run build:cf > /tmp/npm-build-cf.log 2>&1; then
    check_pass "npm run build:cf completed successfully"
  else
    check_fail "npm run build:cf failed" "See /tmp/npm-build-cf.log for details"
    echo "Last 20 lines of npm-build-cf.log:"
    tail -20 /tmp/npm-build-cf.log || true
  fi
else
  check_info "build:cf script not found in package.json (skipping)"
fi

echo ""

# ========================================
# C) ENDPOINT CHECKS (if BASE_URL provided)
# ========================================
if [ -n "$BASE_URL" ]; then
  echo "----------------------------------------"
  echo "C) API Endpoint Checks"
  echo "----------------------------------------"
  
  # Helper function to check endpoint
  check_endpoint() {
    local endpoint="$1"
    local url="${BASE_URL}${endpoint}"
    
    echo "Checking: $url"
    
    # Make request and capture response
    HTTP_CODE=$(curl -o /tmp/endpoint-response.txt -w "%{http_code}" -fsS "$url" 2>/tmp/curl-error.log || echo "000")
    RESPONSE=$(head -c 2000 /tmp/endpoint-response.txt 2>/dev/null || echo "")
    
    echo "  HTTP Status: $HTTP_CODE"
    
    # If curl failed, show error
    if [ "$HTTP_CODE" = "000" ]; then
      check_fail "Endpoint $endpoint - curl request failed"
      if [ -f /tmp/curl-error.log ]; then
        echo "  Curl error:"
        cat /tmp/curl-error.log
      fi
      return
    fi
    
    # Check if response is empty
    if [ -z "$RESPONSE" ]; then
      check_fail "Endpoint $endpoint returned empty response" "HTTP $HTTP_CODE"
      return
    fi
    
    # Check if response is HTML (should be JSON)
    if echo "$RESPONSE" | grep -iq '<html'; then
      check_fail "Endpoint $endpoint returned HTML instead of JSON" "HTTP $HTTP_CODE"
      echo "  Response preview: ${RESPONSE:0:200}"
      return
    fi
    
    # Success
    check_pass "Endpoint $endpoint returned JSON (HTTP $HTTP_CODE)"
    echo "  Response preview: ${RESPONSE:0:200}"
  }
  
  # Check /api/health
  check_endpoint "/api/health"
  echo ""
  
  # Check /api/join
  check_endpoint "/api/join"
  echo ""
  
else
  echo "----------------------------------------"
  echo "C) API Endpoint Checks"
  echo "----------------------------------------"
  check_info "BASE_URL not provided - skipping endpoint checks"
  check_info "To run endpoint checks, provide BASE_URL as argument:"
  check_info "  ./scripts/post-recovery-425-verify.sh https://preview.pages.dev"
  echo ""
fi

# ========================================
# D) OUTPUT SUMMARY
# ========================================
echo "========================================"
echo "VERIFICATION SUMMARY"
echo "========================================"
echo "Total Checks: $CHECK_COUNT"
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo ""
echo "Base URL Used: ${BASE_URL:-"None (endpoint checks skipped)"}"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
  echo "========================================"
  exit 0
else
  echo -e "${RED}✗ SOME CHECKS FAILED${NC}"
  echo "========================================"
  exit 1
fi
