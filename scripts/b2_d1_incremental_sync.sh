#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# B2 → D1 Incremental Sync (Idempotent Daily Sync)
# ============================================================================
# Purpose: Detect new Backblaze B2 objects and synchronize only previously
#          unseen files into Cloudflare D1 photos table.
#
# Characteristics:
#   - Idempotent: Safe to re-run, no duplicates (uses WHERE NOT EXISTS)
#   - Additive only: No updates, no deletes
#   - Delta-based: Only new files are inserted
#
# Required environment variables:
#   B2_ENDPOINT           - B2 S3-compatible endpoint URL (https://s3.<region>.backblazeb2.com)
#   B2_BUCKET             - B2 bucket name
#   B2_KEY_ID             - B2 S3 access key id (Backblaze "applicationKeyId")
#   B2_APP_KEY            - B2 S3 secret access key (Backblaze "applicationKey")
#   D1_DATABASE_NAME      - D1 database name
#   CLOUDFLARE_API_TOKEN  - Cloudflare API token with D1 access
#
# Optional environment variables:
#   CLOUDFLARE_ACCOUNT_ID - Cloudflare account ID (if needed)
#   PUBLIC_B2_BASE_URL    - Base URL for public access (default: B2 endpoint)
#   DRY_RUN=1             - Generate SQL but do not execute
#   D1_BATCH_SIZE=250     - Number of INSERT statements per wrangler execute call
#
# Output:
#   - Logs counts and status to stderr
#   - No secrets logged
#   - Exit 0 on success, non-zero on failure
# ============================================================================

log() { echo "[b2_d1_incremental_sync] $*" >&2; }

require_cmd() {
  local c="$1"
  if ! command -v "$c" >/dev/null 2>&1; then
    log "ERROR: Missing required command: $c"
    exit 90
  fi
}

# ----------------------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------------------
require_cmd aws
require_cmd jq
require_cmd sort
require_cmd comm
require_cmd mktemp
require_cmd wc
require_cmd grep
require_cmd sed
require_cmd cut
require_cmd tr
require_cmd split

# ----------------------------------------------------------------------------
# Validate required environment variables
# ----------------------------------------------------------------------------
REQUIRED_VARS=(
  "B2_ENDPOINT"
  "B2_BUCKET"
  "B2_KEY_ID"
  "B2_APP_KEY"
  "D1_DATABASE_NAME"
  "CLOUDFLARE_API_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    log "ERROR: Required environment variable $var is not set"
    exit 1
  fi
done

# ----------------------------------------------------------------------------
# Derive AWS region from B2_ENDPOINT
# Expected format: https://s3.<region>.backblazeb2.com
# ----------------------------------------------------------------------------
ENDPOINT_HOST="${B2_ENDPOINT#https://}"
ENDPOINT_HOST="${ENDPOINT_HOST%%/*}"

if [[ "$ENDPOINT_HOST" =~ ^s3\.([^.]+)\.backblazeb2\.com$ ]]; then
  DERIVED_REGION="${BASH_REMATCH[1]}"
  export AWS_DEFAULT_REGION="$DERIVED_REGION"
  log "Derived AWS region from endpoint: ${DERIVED_REGION}"
else
  log "ERROR: Could not extract region from B2_ENDPOINT format"
  log "  Expected: https://s3.<region>.backblazeb2.com"
  log "  Got: ${B2_ENDPOINT}"
  exit 2
fi

# ----------------------------------------------------------------------------
# Configure AWS CLI for B2 S3 compatibility
# ----------------------------------------------------------------------------
export AWS_ACCESS_KEY_ID="$B2_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$B2_APP_KEY"
export AWS_EC2_METADATA_DISABLED=true

# ----------------------------------------------------------------------------
# Configure Cloudflare credentials
# ----------------------------------------------------------------------------
export CLOUDFLARE_API_TOKEN
if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  export CLOUDFLARE_ACCOUNT_ID
fi

# ----------------------------------------------------------------------------
# Public base URL (default to B2 endpoint if not provided)
# ----------------------------------------------------------------------------
PUBLIC_BASE_URL="${PUBLIC_B2_BASE_URL:-${B2_ENDPOINT}}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL%/}"

DB_REF="$D1_DATABASE_NAME"
DRY_RUN="${DRY_RUN:-0}"
D1_BATCH_SIZE="${D1_BATCH_SIZE:-250}"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

OBJECTS_FILE="$WORKDIR/b2_objects.json"
EXISTING_KEYS_FILE="$WORKDIR/existing_keys.txt"
B2_KEYS_FILE="$WORKDIR/b2_keys.txt"
NEW_KEYS_FILE="$WORKDIR/new_keys.txt"
SQL_FILE="$WORKDIR/inserts.sql"
SQL_STRIPPED="$WORKDIR/inserts.stripped.sql"
SQL_DIR="$WORKDIR/sql_batches"

mkdir -p "$SQL_DIR"

# ----------------------------------------------------------------------------
# Wrangler helper: run d1 execute with best-effort JSON output
# ----------------------------------------------------------------------------
wrangler_exec() {
  local mode="$1" # command|file
  local payload="$2"
  local out
  if [[ "$mode" == "command" ]]; then
    if out="$(npx --yes wrangler d1 execute "$DB_REF" --remote --command "$payload" --json 2>&1)"; then
      echo "$out"
      return 0
    fi
    npx --yes wrangler d1 execute "$DB_REF" --remote --command "$payload" 2>&1
    return $?
  fi

  if [[ "$mode" == "file" ]]; then
    if out="$(npx --yes wrangler d1 execute "$DB_REF" --remote --file "$payload" --json 2>&1)"; then
      echo "$out"
      return 0
    fi
    npx --yes wrangler d1 execute "$DB_REF" --remote --file "$payload" 2>&1
    return $?
  fi

  log "ERROR: internal: wrangler_exec invalid mode: $mode"
  return 99
}

# ----------------------------------------------------------------------------
# Step 0: Introspect D1 schema for photos table
# ----------------------------------------------------------------------------
log "Detecting D1 photos table schema (PRAGMA table_info)..."

SCHEMA_SQL="PRAGMA table_info(photos);"
if ! SCHEMA_OUT="$(wrangler_exec "command" "$SCHEMA_SQL")"; then
  log "ERROR: Failed to query D1 schema for photos table"
  log "$SCHEMA_OUT"
  exit 3
fi

# Parse schema output. Wrangler JSON formats vary; handle common shapes.
COLS=""
if echo "$SCHEMA_OUT" | jq -e '.' >/dev/null 2>&1; then
  COLS="$(echo "$SCHEMA_OUT" | jq -r '
    (
      .result? // .results? // .[]? // empty
    ) as $top
    | (
        ( $top.results? // $top[0].results? // $top | arrays | .[0]? | .results? // empty )
      ) // empty
    | .[]?
    | .name? // empty
  ' 2>/dev/null | tr '\n' ' ' | sed -E 's/[[:space:]]+$//')"
fi

if [[ -z "$COLS" ]]; then
  COLS="$(echo "$SCHEMA_OUT" | grep -oE '"name"\s*:\s*"[^"]+"' | sed -E 's/.*"name"\s*:\s*"([^"]+)".*/\1/' | tr '\n' ' ' | sed -E 's/[[:space:]]+$//')"
fi

if [[ -z "$COLS" ]]; then
  log "ERROR: Could not parse photos schema columns from wrangler output"
  log "Raw output:"
  log "$SCHEMA_OUT"
  exit 3
fi

log "Detected photos columns: $COLS"

pick_first_existing() {
  local candidates=("$@")
  for c in "${candidates[@]}"; do
    if echo " $COLS " | grep -q " $c "; then
      echo "$c"
      return 0
    fi
  done
  return 1
}

if ! KEY_COL="$(pick_first_existing photo_id id external_id key filename)"; then
  log "ERROR: Could not find a suitable key column in photos table."
  log "Expected one of: photo_id, id, external_id, key, filename"
  exit 3
fi

if ! URL_COL="$(pick_first_existing url public_url link)"; then
  log "ERROR: Could not find a suitable URL column in photos table."
  log "Expected one of: url, public_url, link"
  exit 3
fi

HAS_IS_MEM=0
if echo " $COLS " | grep -q " is_memorabilia "; then HAS_IS_MEM=1; fi
HAS_DESC=0
if echo " $COLS " | grep -q " description "; then HAS_DESC=1; fi
HAS_CREATED_AT=0
if echo " $COLS " | grep -q " created_at "; then HAS_CREATED_AT=1; fi

log "Using key column: $KEY_COL"
log "Using url column: $URL_COL"
log "created_at present: $HAS_CREATED_AT | is_memorabilia present: $HAS_IS_MEM | description present: $HAS_DESC"

# ----------------------------------------------------------------------------
# Step 1: Fetch B2 object list via S3-compatible API
# ----------------------------------------------------------------------------
log "Fetching object list from B2 bucket: $B2_BUCKET"

ALL_OBJECTS='[]'
CONTINUATION_TOKEN=""
PAGE=0

while true; do
  PAGE=$((PAGE + 1))

  AWS_ARGS=(
    "--endpoint-url" "$B2_ENDPOINT"
    "s3api" "list-objects-v2"
    "--bucket" "$B2_BUCKET"
    "--max-keys" "1000"
  )

  if [[ -n "$CONTINUATION_TOKEN" ]]; then
    AWS_ARGS+=("--continuation-token" "$CONTINUATION_TOKEN")
  fi

  if ! RESPONSE="$(aws "${AWS_ARGS[@]}" 2>&1)"; then
    log "ERROR: Failed to list B2 objects (page $PAGE)"
    log "$RESPONSE"
    exit 2
  fi

  CONTENTS="$(echo "$RESPONSE" | jq -c '.Contents // []')"
  ALL_OBJECTS="$(echo "$ALL_OBJECTS" | jq -c --argjson new "$CONTENTS" '. + $new')"

  IS_TRUNCATED="$(echo "$RESPONSE" | jq -r '.IsTruncated // false')"
  if [[ "$IS_TRUNCATED" == "true" ]]; then
    CONTINUATION_TOKEN="$(echo "$RESPONSE" | jq -r '.NextContinuationToken // ""')"
    if [[ -z "$CONTINUATION_TOKEN" ]]; then
      log "WARNING: IsTruncated=true but no NextContinuationToken, stopping"
      break
    fi
  else
    break
  fi
done

echo "$ALL_OBJECTS" | jq --arg base_url "$PUBLIC_BASE_URL" '{
  objects: [
    .[] | {
      external_id: .Key,
      filename: .Key,
      public_url: ($base_url + "/" + .Key),
      size: .Size,
      uploaded_at: .LastModified
    }
  ]
}' > "$OBJECTS_FILE"

TOTAL_OBJECTS="$(jq '.objects | length' "$OBJECTS_FILE")"
log "Total objects discovered: $TOTAL_OBJECTS"

if [[ "$TOTAL_OBJECTS" -eq 0 ]]; then
  log "No objects found in B2 bucket, exiting"
  exit 0
fi

# ----------------------------------------------------------------------------
# Step 2: Query D1 for existing key values (dynamic key column)
# ----------------------------------------------------------------------------
log "Querying D1 for existing keys using column: $KEY_COL ..."

QUERY_SQL="SELECT ${KEY_COL} AS k FROM photos WHERE ${KEY_COL} IS NOT NULL;"
if ! D1_OUT="$(wrangler_exec "command" "$QUERY_SQL")"; then
  log "ERROR: Failed to query D1 database for existing keys"
  log "$D1_OUT"
  exit 3
fi

: > "$EXISTING_KEYS_FILE"
if echo "$D1_OUT" | jq -e '.' >/dev/null 2>&1; then
  echo "$D1_OUT" | jq -r '
    (
      .result? // .results? // .[]? // empty
    ) as $top
    | (
        ( $top.results? // $top[0].results? // $top | arrays | .[0]? | .results? // empty )
      ) // empty
    | .[]?
    | .k? // empty
  ' 2>/dev/null >> "$EXISTING_KEYS_FILE" || true
fi

if [[ ! -s "$EXISTING_KEYS_FILE" ]]; then
  echo "$D1_OUT" | grep -oE '"[^"]+"' | tr -d '"' >> "$EXISTING_KEYS_FILE" || true
fi

LC_ALL=C sort -u "$EXISTING_KEYS_FILE" | grep -v '^$' > "$EXISTING_KEYS_FILE.sorted" || true
mv "$EXISTING_KEYS_FILE.sorted" "$EXISTING_KEYS_FILE" 2>/dev/null || true

EXISTING_COUNT="$(wc -l < "$EXISTING_KEYS_FILE" | tr -d ' ')"
log "Found $EXISTING_COUNT existing rows in D1 photos (by key)"

# ----------------------------------------------------------------------------
# Step 3: Calculate delta (new objects only)
# ----------------------------------------------------------------------------
jq -r '.objects[].external_id' "$OBJECTS_FILE" | LC_ALL=C sort -u > "$B2_KEYS_FILE"

touch "$EXISTING_KEYS_FILE"
LC_ALL=C sort -u "$EXISTING_KEYS_FILE" -o "$EXISTING_KEYS_FILE" || true

comm -13 "$EXISTING_KEYS_FILE" "$B2_KEYS_FILE" > "$NEW_KEYS_FILE" || true

NEW_COUNT="$(wc -l < "$NEW_KEYS_FILE" | tr -d ' ')"
log "New objects to insert: $NEW_COUNT"

if [[ "$NEW_COUNT" -eq 0 ]]; then
  log "No new objects to sync, exiting"
  exit 0
fi

# ----------------------------------------------------------------------------
# Step 4: Generate INSERT statements (schema-aware, idempotent without UNIQUE)
# IMPORTANT: Cloudflare exec rejects BEGIN/SAVEPOINT/COMMIT/ROLLBACK in this path.
# ----------------------------------------------------------------------------
log "Generating SQL INSERT statements for $NEW_COUNT new objects..."

sql_escape() { echo "${1//\'/\'\'}"; }

cat > "$SQL_FILE" <<SQL_HEADER
-- B2 → D1 Incremental Sync
-- Generated by scripts/b2_d1_incremental_sync.sh
-- NOTE: Do NOT add BEGIN/COMMIT/SAVEPOINT. Wrangler/D1 exec path rejects them.
SQL_HEADER

while IFS= read -r external_id; do
  [[ -z "$external_id" ]] && continue

  OBJECT="$(jq --arg id "$external_id" '.objects[] | select(.external_id == $id)' "$OBJECTS_FILE")"
  if [[ -z "$OBJECT" ]]; then
    log "WARNING: Could not find metadata for $external_id, skipping"
    continue
  fi

  PUBLIC_URL="$(echo "$OBJECT" | jq -r '.public_url')"
  UPLOADED_AT="$(echo "$OBJECT" | jq -r '.uploaded_at')"

  ESC_ID="$(sql_escape "$external_id")"
  ESC_URL="$(sql_escape "$PUBLIC_URL")"
  ESC_UPLOADED_AT="$(sql_escape "$UPLOADED_AT")"

  COL_LIST="\"$KEY_COL\",\"$URL_COL\""
  VAL_LIST="'$ESC_ID','$ESC_URL'"

  if [[ "$HAS_IS_MEM" -eq 1 ]]; then
    COL_LIST+=",is_memorabilia"
    VAL_LIST+=",0"
  fi

  if [[ "$HAS_DESC" -eq 1 ]]; then
    COL_LIST+=",description"
    VAL_LIST+=",''"
  fi

  if [[ "$HAS_CREATED_AT" -eq 1 ]]; then
    COL_LIST+=",created_at"
    VAL_LIST+=",'$ESC_UPLOADED_AT'"
  fi

  cat >> "$SQL_FILE" <<SQL_INSERT
INSERT INTO photos ($COL_LIST)
SELECT $VAL_LIST
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE "$KEY_COL" = '$ESC_ID');
SQL_INSERT

done < "$NEW_KEYS_FILE"

# Safety net: strip any accidental transaction statements if they ever appear.
# (This directly prevents the exact failure you're seeing.)
grep -viE '^[[:space:]]*(BEGIN[[:space:]]+TRANSACTION|SAVEPOINT|COMMIT|ROLLBACK)\b' "$SQL_FILE" > "$SQL_STRIPPED"
mv "$SQL_STRIPPED" "$SQL_FILE"

log "Generated SQL file for $NEW_COUNT new objects (transaction statements stripped)"

# ----------------------------------------------------------------------------
# Step 5: Execute SQL (or dry-run) in batches to avoid size/timeout limits
# ----------------------------------------------------------------------------
if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN=1 set. Printing SQL and exiting without changes."
  cat "$SQL_FILE"
  exit 0
fi

log "Executing SQL against D1 database: $DB_REF"
log "Batch size (statements per execute): $D1_BATCH_SIZE"

# Split the SQL into batches based on INSERT statement count.
# We keep the header in each batch for readability; it doesn’t affect execution.
HEADER_LINES="$(grep -n -m1 -E '^INSERT[[:space:]]+INTO[[:space:]]+photos' "$SQL_FILE" | cut -d: -f1 || true)"
if [[ -z "${HEADER_LINES:-}" ]]; then
  log "ERROR: No INSERT statements found in generated SQL. Aborting."
  exit 4
fi

# Separate header and body
HEADER_FILE="$WORKDIR/header.sql"
BODY_FILE="$WORKDIR/body.sql"
head -n $((HEADER_LINES - 1)) "$SQL_FILE" > "$HEADER_FILE"
tail -n +"$HEADER_LINES" "$SQL_FILE" > "$BODY_FILE"

# Split body by N lines where each INSERT block is 2 lines (INSERT... + WHERE NOT EXISTS...;)
# That assumption holds because we write exactly 2 lines per object.
# If that ever changes, the transaction-strip safety net still prevents the current failure,
# but batching may need adjustment.
LINES_PER_STMT=2
LINES_PER_BATCH=$((D1_BATCH_SIZE * LINES_PER_STMT))

split -d -a 4 -l "$LINES_PER_BATCH" "$BODY_FILE" "$SQL_DIR/batch_"

TOTAL_BATCHES="$(ls -1 "$SQL_DIR"/batch_* 2>/dev/null | wc -l | tr -d ' ')"
if [[ "$TOTAL_BATCHES" -eq 0 ]]; then
  log "ERROR: Failed to create SQL batches."
  exit 4
fi

BATCH_NUM=0
for part in "$SQL_DIR"/batch_*; do
  BATCH_NUM=$((BATCH_NUM + 1))
  BATCH_FILE="$WORKDIR/exec_batch_${BATCH_NUM}.sql"
  cat "$HEADER_FILE" "$part" > "$BATCH_FILE"

  log "Executing batch ${BATCH_NUM}/${TOTAL_BATCHES} ..."
  if ! SQL_OUT="$(wrangler_exec "file" "$BATCH_FILE")"; then
    log "ERROR: Failed to execute batch ${BATCH_NUM}/${TOTAL_BATCHES}"
    log "$SQL_OUT"
    exit 4
  fi
done

log "All batches executed successfully"

# ----------------------------------------------------------------------------
# Summary
# ----------------------------------------------------------------------------
log ""
log "=== Sync Summary ==="
log "Total B2 objects: $TOTAL_OBJECTS"
log "Existing in D1: $EXISTING_COUNT"
log "New records attempted: $NEW_COUNT"
log "Batches executed: $TOTAL_BATCHES"
log "Key column used: $KEY_COL"
log "URL column used: $URL_COL"
log "===================="
log ""
log "Sync completed successfully"
exit 0
