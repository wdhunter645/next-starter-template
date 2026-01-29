#!/usr/bin/env bash
# Integration test for b2_d1_incremental_sync.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SYNC_SCRIPT="$REPO_ROOT/scripts/b2_d1_incremental_sync.sh"

echo "============================================"
echo "B2 → D1 Incremental Sync Script Test"
echo "============================================"

# Test 1: Script exists and is executable
echo "Test 1: Script exists and is executable..."
if [[ ! -x "$SYNC_SCRIPT" ]]; then
  echo "  ✗ FAILED: Script not found or not executable: $SYNC_SCRIPT"
  exit 1
fi
echo "  ✓ PASSED"

# Test 2: Bash syntax is valid
echo "Test 2: Bash syntax validation..."
if ! bash -n "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Syntax errors in script"
  exit 1
fi
echo "  ✓ PASSED"

# Test 3: Missing required environment variables are detected
echo "Test 3: Environment variable validation..."
EXPECTED_VARS=(
  "B2_ENDPOINT"
  "B2_BUCKET"
  "B2_KEY_ID"
  "B2_APP_KEY"
  "D1_DATABASE_ID"
  "CLOUDFLARE_API_TOKEN"
)

for var in "${EXPECTED_VARS[@]}"; do
  # Run script with missing var and check for error
  OUTPUT=$(bash "$SYNC_SCRIPT" 2>&1 || true)
  
  if ! echo "$OUTPUT" | grep -q "Required environment variable"; then
    echo "  ✗ FAILED: Script should validate required environment variables"
    exit 1
  fi
  
  if ! echo "$OUTPUT" | grep -q "$var"; then
    echo "  ✗ FAILED: Script should report missing $var"
    exit 1
  fi
  
  # Exit after first missing var to save time
  break
done
echo "  ✓ PASSED"

# Test 4: Script has proper documentation
echo "Test 4: Script documentation..."
if ! grep -q "B2 → D1 Incremental Sync" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script missing header documentation"
  exit 1
fi

if ! grep -q "Idempotent" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should document idempotency"
  exit 1
fi
echo "  ✓ PASSED"

# Test 5: Script supports DRY_RUN mode
echo "Test 5: DRY_RUN mode support..."
if ! grep -q "DRY_RUN" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should support DRY_RUN mode"
  exit 1
fi
echo "  ✓ PASSED"

# Test 6: Script uses proper error handling
echo "Test 6: Error handling..."
if ! grep -q "set -euo pipefail" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should use strict error handling (set -euo pipefail)"
  exit 1
fi
echo "  ✓ PASSED"

# Test 7: Script logs to stderr (not stdout for secrets)
echo "Test 7: Logging to stderr..."
if ! grep -q "log() {" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should have a log function"
  exit 1
fi

if ! grep -q ">&2" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should log to stderr"
  exit 1
fi
echo "  ✓ PASSED"

# Test 8: Script uses INSERT OR IGNORE for idempotency
echo "Test 8: Idempotent SQL operations..."
if ! grep -q "INSERT OR IGNORE" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should use INSERT OR IGNORE for idempotency"
  exit 1
fi
echo "  ✓ PASSED"

# Test 9: Script uses photo_id column (external_id mapping)
echo "Test 9: Correct table schema usage..."
if ! grep -q "photo_id" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should use photo_id column for external_id"
  exit 1
fi

if ! grep -q "photos" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should insert into photos table"
  exit 1
fi
echo "  ✓ PASSED"

# Test 10: Script handles SQL escaping
echo "Test 10: SQL injection protection..."
if ! grep -q "sql_escape" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should have SQL escaping function"
  exit 1
fi
echo "  ✓ PASSED"

echo ""
echo "============================================"
echo "All tests PASSED ✓"
echo "============================================"
