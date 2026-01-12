#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# B2 → D1 Incremental Sync (Idempotent Daily Sync)
# ============================================================================
# Purpose: Detect new Backblaze B2 objects and synchronize only previously
#          unseen files into Cloudflare D1 photos table.
#
# Characteristics:
#   - Idempotent: Safe to re-run, no duplicates
#   - Additive only: No updates, no deletes
#   - Delta-based: Only new files are inserted
#
# Required environment variables:
#   B2_ENDPOINT          - B2 S3-compatible endpoint URL
#   B2_BUCKET            - B2 bucket name
#   B2_KEY_ID            - B2 application key ID
#   B2_APP_KEY           - B2 application key
#   D1_DATABASE_ID       - D1 database ID (or name)
#   CLOUDFLARE_API_TOKEN - Cloudflare API token with D1 access
#
# Optional environment variables:
#   CLOUDFLARE_ACCOUNT_ID - Cloudflare account ID (if needed)
#   PUBLIC_B2_BASE_URL    - Base URL for public access (default: B2 endpoint)
#   DRY_RUN=1             - Generate SQL but do not execute
#
# Output:
#   - Logs counts and status to stderr
#   - No secrets logged
#   - Exit 0 on success, non-zero on failure
# ============================================================================

# Log helper (to stderr)
log() {
  echo "[b2_d1_incremental_sync] $*" >&2
}

# Validate required environment variables
REQUIRED_VARS=(
  "B2_ENDPOINT"
  "B2_BUCKET"
  "B2_KEY_ID"
  "B2_APP_KEY"
  "D1_DATABASE_ID"
  "CLOUDFLARE_API_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    log "ERROR: Required environment variable $var is not set"
    exit 1
  fi
done

# Derive AWS region from B2_ENDPOINT
# Expected format: https://s3.<region>.backblazeb2.com
# Extract region from hostname
ENDPOINT_HOST="${B2_ENDPOINT#https://}"
ENDPOINT_HOST="${ENDPOINT_HOST%%/*}"
# Extract region from s3.<region>.backblazeb2.com pattern
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

# Configure AWS CLI for B2 S3 compatibility
export AWS_ACCESS_KEY_ID="$B2_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$B2_APP_KEY"
export AWS_EC2_METADATA_DISABLED=true
# AWS_DEFAULT_REGION already set above from endpoint derivation

# Configure Cloudflare credentials
export CLOUDFLARE_API_TOKEN
if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  export CLOUDFLARE_ACCOUNT_ID
fi

# Set public base URL (default to B2 endpoint if not provided)
PUBLIC_BASE_URL="${PUBLIC_B2_BASE_URL:-${B2_ENDPOINT}}"
# Trim trailing slashes
PUBLIC_BASE_URL="${PUBLIC_BASE_URL%/}"

# Determine database reference (ID or name)
DB_REF="$D1_DATABASE_ID"

# Dry run mode
DRY_RUN="${DRY_RUN:-0}"

# Temporary working directory
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

OBJECTS_FILE="$WORKDIR/b2_objects.json"
EXISTING_IDS_FILE="$WORKDIR/existing_ids.txt"
NEW_IDS_FILE="$WORKDIR/new_ids.txt"
SQL_FILE="$WORKDIR/inserts.sql"

# ============================================================================
# Step 1: Fetch B2 object list via S3-compatible API
# ============================================================================
log "Fetching object list from B2 bucket: $B2_BUCKET"

ALL_OBJECTS='[]'
CONTINUATION_TOKEN=""
PAGE=0

while true; do
  PAGE=$((PAGE + 1))
  
  # Build AWS CLI command
  AWS_ARGS=(
    "--endpoint-url" "$B2_ENDPOINT"
    "s3api" "list-objects-v2"
    "--bucket" "$B2_BUCKET"
    "--max-keys" "1000"
  )
  
  if [[ -n "$CONTINUATION_TOKEN" ]]; then
    AWS_ARGS+=("--continuation-token" "$CONTINUATION_TOKEN")
  fi
  
  # Execute AWS CLI
  if ! RESPONSE=$(aws "${AWS_ARGS[@]}" 2>&1); then
    log "ERROR: Failed to list B2 objects (page $PAGE)"
    log "$RESPONSE"
    exit 2
  fi
  
  # Extract Contents array and merge
  CONTENTS=$(echo "$RESPONSE" | jq -c '.Contents // []')
  ALL_OBJECTS=$(echo "$ALL_OBJECTS" | jq -c --argjson new "$CONTENTS" '. + $new')
  
  # Check for pagination
  IS_TRUNCATED=$(echo "$RESPONSE" | jq -r '.IsTruncated // false')
  if [[ "$IS_TRUNCATED" == "true" ]]; then
    CONTINUATION_TOKEN=$(echo "$RESPONSE" | jq -r '.NextContinuationToken // ""')
    if [[ -z "$CONTINUATION_TOKEN" ]]; then
      log "WARNING: IsTruncated=true but no NextContinuationToken, stopping"
      break
    fi
  else
    break
  fi
done

# Normalize B2 objects to our schema
# Map to: external_id (from Key), filename (from Key), public_url, size, uploaded_at
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

TOTAL_OBJECTS=$(jq '.objects | length' "$OBJECTS_FILE")
log "Total objects discovered: $TOTAL_OBJECTS"

if [[ $TOTAL_OBJECTS -eq 0 ]]; then
  log "No objects found in B2 bucket, exiting"
  exit 0
fi

# ============================================================================
# Step 2: Query D1 for existing external_id values
# ============================================================================
log "Querying D1 for existing photo_id values..."

# Use wrangler to query D1
QUERY_SQL="SELECT photo_id FROM photos WHERE photo_id IS NOT NULL"

if ! D1_OUTPUT=$(npx wrangler d1 execute "$DB_REF" --remote --command "$QUERY_SQL" 2>&1); then
  log "ERROR: Failed to query D1 database"
  log "$D1_OUTPUT"
  exit 3
fi

# Parse D1 output to extract photo_id values
# Wrangler output format varies, attempt multiple parsing strategies
true > "$EXISTING_IDS_FILE"  # Clear file

# Try JSON parsing first
if echo "$D1_OUTPUT" | jq -e '.results' >/dev/null 2>&1; then
  echo "$D1_OUTPUT" | jq -r '.results[]?.photo_id // empty' > "$EXISTING_IDS_FILE"
elif echo "$D1_OUTPUT" | jq -e '.[].photo_id' >/dev/null 2>&1; then
  echo "$D1_OUTPUT" | jq -r '.[] | .photo_id // empty' > "$EXISTING_IDS_FILE"
else
  # Fallback: extract any quoted strings that look like file paths
  echo "$D1_OUTPUT" | grep -oE '"[^"]+\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP)"' | tr -d '"' > "$EXISTING_IDS_FILE" || true
fi

# Remove empty lines and sort
sort -u "$EXISTING_IDS_FILE" | grep -v '^$' > "$EXISTING_IDS_FILE.sorted" || true
mv "$EXISTING_IDS_FILE.sorted" "$EXISTING_IDS_FILE" 2>/dev/null || true

EXISTING_COUNT=$(wc -l < "$EXISTING_IDS_FILE" | tr -d ' ')
log "Found $EXISTING_COUNT existing photo records in D1"

# ============================================================================
# Step 3: Calculate delta (new objects only)
# ============================================================================
# Extract external_ids from B2 objects
jq -r '.objects[].external_id' "$OBJECTS_FILE" | sort -u > "$WORKDIR/b2_ids.txt"

# Find IDs in B2 but not in D1
comm -13 "$EXISTING_IDS_FILE" "$WORKDIR/b2_ids.txt" > "$NEW_IDS_FILE"

NEW_COUNT=$(wc -l < "$NEW_IDS_FILE" | tr -d ' ')
log "New objects to insert: $NEW_COUNT"

if [[ $NEW_COUNT -eq 0 ]]; then
  log "No new objects to sync, exiting"
  exit 0
fi

# ============================================================================
# Step 4: Generate parameterized INSERT statements
# ============================================================================
log "Generating SQL INSERT statements for $NEW_COUNT new objects..."

# SQL escape helper (inline)
sql_escape() {
  local input="$1"
  echo "${input//\'/\'\'}"
}

# Start SQL file
cat > "$SQL_FILE" <<'SQL_HEADER'
-- B2 → D1 Incremental Sync
-- Generated by scripts/b2_d1_incremental_sync.sh
BEGIN TRANSACTION;
SQL_HEADER

# Add INSERT OR IGNORE for each new object
while IFS= read -r external_id; do
  if [[ -z "$external_id" ]]; then
    continue
  fi
  
  # Find full object metadata from JSON
  OBJECT=$(jq --arg id "$external_id" '.objects[] | select(.external_id == $id)' "$OBJECTS_FILE")
  
  if [[ -z "$OBJECT" ]]; then
    log "WARNING: Could not find metadata for $external_id, skipping"
    continue
  fi
  
  # Extract fields
  PUBLIC_URL=$(echo "$OBJECT" | jq -r '.public_url')
  UPLOADED_AT=$(echo "$OBJECT" | jq -r '.uploaded_at')
  
  # SQL escape all string fields
  ESCAPED_ID=$(sql_escape "$external_id")
  ESCAPED_URL=$(sql_escape "$PUBLIC_URL")
  ESCAPED_UPLOADED_AT=$(sql_escape "$UPLOADED_AT")
  
  # Generate INSERT OR IGNORE statement
  # Using photo_id as external_id, url as public_url
  # Description field can store JSON metadata if needed
  cat >> "$SQL_FILE" <<SQL_INSERT
INSERT OR IGNORE INTO photos (photo_id, url, is_memorabilia, description, created_at)
VALUES ('$ESCAPED_ID', '$ESCAPED_URL', 0, '', '$ESCAPED_UPLOADED_AT');
SQL_INSERT

done < "$NEW_IDS_FILE"

echo "COMMIT;" >> "$SQL_FILE"

log "Generated SQL file with $NEW_COUNT INSERT statements"

# ============================================================================
# Step 5: Execute SQL or print for dry-run
# ============================================================================
if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN mode enabled, SQL would be executed:"
  cat "$SQL_FILE"
  log "DRY_RUN complete (no changes made)"
  exit 0
fi

log "Executing SQL against D1 database: $DB_REF"

if ! SQL_OUTPUT=$(npx wrangler d1 execute "$DB_REF" --remote --file "$SQL_FILE" 2>&1); then
  log "ERROR: Failed to execute SQL against D1"
  log "$SQL_OUTPUT"
  exit 4
fi

log "SQL execution successful"

# ============================================================================
# Summary
# ============================================================================
log ""
log "=== Sync Summary ==="
log "Total B2 objects: $TOTAL_OBJECTS"
log "Existing in D1: $EXISTING_COUNT"
log "New records inserted: $NEW_COUNT"
log "===================="
log ""
log "Sync completed successfully"

exit 0
