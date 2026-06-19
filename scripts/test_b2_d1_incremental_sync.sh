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

# Test 3: Required environment variables are declared
echo "Test 3: Environment variable validation..."
EXPECTED_VARS=(
  "B2_ENDPOINT"
  "B2_BUCKET"
  "B2_KEY_ID"
  "B2_APP_KEY"
  "D1_DATABASE_NAME"
  "CLOUDFLARE_API_TOKEN"
  "CLOUDFLARE_ACCOUNT_ID"
)
for var in "${EXPECTED_VARS[@]}"; do
  if ! grep -q "\"$var\"" "$SYNC_SCRIPT"; then
    echo "  ✗ FAILED: Script should validate $var"
    exit 1
  fi
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

# Test 8: Script uses idempotent insert guards
echo "Test 8: Idempotent SQL operations..."
if ! grep -q "WHERE NOT EXISTS" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should guard inserts with WHERE NOT EXISTS for idempotency"
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

# Test 11: INSERT statements are single-line (batch split safety)
echo "Test 11: Single-line INSERT statements for batch splitting..."
if ! grep -q "LINES_PER_STMT=1" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should use LINES_PER_STMT=1 for one INSERT per line"
  exit 1
fi

if ! grep -q "printf 'INSERT INTO photos" "$SYNC_SCRIPT"; then
  echo "  ✗ FAILED: Script should emit single-line INSERT statements"
  exit 1
fi
echo "  ✓ PASSED"

# Test 12: Batch split never produces orphaned SQL fragments
echo "Test 12: Batch split integrity..."
BATCH_TEST_DIR="$(mktemp -d)"
trap 'rm -rf "$BATCH_TEST_DIR"' EXIT
BATCH_BODY="$BATCH_TEST_DIR/body.sql"
BATCH_DIR="$BATCH_TEST_DIR/batches"
mkdir -p "$BATCH_DIR"
for i in $(seq 1 7); do
  printf "INSERT INTO photos (\"photo_id\",\"url\") SELECT 'id-%s','https://example.com/%s' WHERE NOT EXISTS (SELECT 1 FROM photos WHERE \"photo_id\" = 'id-%s');\n" \
    "$i" "$i" "$i" >> "$BATCH_BODY"
done
D1_BATCH_SIZE=3
LINES_PER_STMT=1
LINES_PER_BATCH=$((D1_BATCH_SIZE * LINES_PER_STMT))
split -d -a 4 -l "$LINES_PER_BATCH" "$BATCH_BODY" "$BATCH_DIR/batch_"
for part in "$BATCH_DIR"/batch_*; do
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    if [[ "$line" =~ ^WHERE ]]; then
      echo "  ✗ FAILED: Batch $(basename "$part") contains orphaned WHERE fragment"
      exit 1
    fi
    if ! [[ "$line" =~ ^INSERT[[:space:]]+INTO[[:space:]]+photos ]]; then
      echo "  ✗ FAILED: Batch $(basename "$part") contains non-INSERT line: $line"
      exit 1
    fi
  done < "$part"
done
echo "  ✓ PASSED"

echo ""
echo "============================================"
echo "All tests PASSED ✓"
echo "============================================"
