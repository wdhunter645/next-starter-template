#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# B2 → D1 Daily Sync (Delta Only)
# ============================================================================
# Purpose: List B2 objects, diff against committed snapshot, upsert only new
#          keys into D1, then update snapshot in repo.
#
# Required env vars:
#   B2_KEY_ID, B2_APP_KEY, B2_ENDPOINT, B2_BUCKET
#   PUBLIC_B2_BASE_URL
#   CF_API_TOKEN, CF_ACCOUNT_ID
#   D1_DATABASE_NAME
#
# Snapshot file (committed): data/b2/inventory.json
# ============================================================================

# Validate required environment variables
REQUIRED_VARS=(
  "B2_KEY_ID"
  "B2_APP_KEY"
  "B2_ENDPOINT"
  "B2_BUCKET"
  "PUBLIC_B2_BASE_URL"
  "CF_API_TOKEN"
  "CF_ACCOUNT_ID"
  "D1_DATABASE_NAME"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: Required environment variable $var is not set" >&2
    exit 1
  fi
done

# Configure AWS CLI for B2 S3 compatibility
export AWS_ACCESS_KEY_ID="$B2_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$B2_APP_KEY"
export AWS_EC2_METADATA_DISABLED=true
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

# Configure Cloudflare credentials for wrangler
export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"
export CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID"

# Paths
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SNAPSHOT_FILE="$REPO_ROOT/data/b2/inventory.json"
WORKDIR="$REPO_ROOT/data/b2"
CURRENT_LISTING="$WORKDIR/current.json"
SQL_FILE="$WORKDIR/new_objects_upsert.sql"

# Ensure snapshot file exists
if [[ ! -f "$SNAPSHOT_FILE" ]]; then
  echo "Snapshot file not found at $SNAPSHOT_FILE, treating as empty" >&2
  mkdir -p "$WORKDIR"
  echo '{"objects":[]}' > "$SNAPSHOT_FILE"
fi

# Step 1: List all B2 objects with pagination
echo "Listing B2 objects from bucket: $B2_BUCKET"
ALL_OBJECTS='[]'
CONTINUATION_TOKEN=""

while true; do
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
  RESPONSE=$(aws "${AWS_ARGS[@]}")
  
  # Extract Contents array and merge
  CONTENTS=$(echo "$RESPONSE" | jq -c '.Contents // []')
  ALL_OBJECTS=$(echo "$ALL_OBJECTS" | jq -c --argjson new "$CONTENTS" '. + $new')
  
  # Check for pagination
  IS_TRUNCATED=$(echo "$RESPONSE" | jq -r '.IsTruncated // false')
  if [[ "$IS_TRUNCATED" == "true" ]]; then
    CONTINUATION_TOKEN=$(echo "$RESPONSE" | jq -r '.NextContinuationToken // ""')
    if [[ -z "$CONTINUATION_TOKEN" ]]; then
      break
    fi
  else
    break
  fi
done

# Step 2: Normalize to inventory format
echo "$ALL_OBJECTS" | jq '{
  objects: [
    .[] | {
      key: .Key,
      size_bytes: .Size,
      last_modified: .LastModified,
      etag: .ETag
    }
  ]
}' > "$CURRENT_LISTING"

TOTAL_OBJECTS=$(jq '.objects | length' "$CURRENT_LISTING")
echo "Total objects discovered: $TOTAL_OBJECTS"

# Step 3: Diff against prior snapshot
PRIOR_KEYS=$(jq -r '.objects[].key' "$SNAPSHOT_FILE" | sort)
CURRENT_KEYS=$(jq -r '.objects[].key' "$CURRENT_LISTING" | sort)

# Find new keys (in current but not in prior)
NEW_KEYS=$(comm -13 <(echo "$PRIOR_KEYS") <(echo "$CURRENT_KEYS"))
# Filter out empty lines before counting
FILTERED_KEYS=$(echo "$NEW_KEYS" | grep -v '^$' || true)
if [[ -z "$FILTERED_KEYS" ]]; then
  NEW_COUNT=0
else
  NEW_COUNT=$(echo "$FILTERED_KEYS" | wc -l)
  # Use filtered keys for iteration
  NEW_KEYS="$FILTERED_KEYS"
fi

echo "New objects detected: $NEW_COUNT"

# Step 4: Generate SQL for new objects only
if [[ $NEW_COUNT -eq 0 ]]; then
  echo "No new objects to sync; skipping D1 upsert"
  # Update snapshot anyway (timestamps may have changed)
  cp "$CURRENT_LISTING" "$SNAPSHOT_FILE"
  echo "Snapshot updated at: $SNAPSHOT_FILE"
  exit 0
fi

# Build SQL file
# Trim trailing slash from base URL
BASE_URL=$(echo "$PUBLIC_B2_BASE_URL" | sed 's:/*$::')

cat > "$SQL_FILE" <<'SQL_HEADER'
BEGIN TRANSACTION;
CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_photo_id ON photos(photo_id);
SQL_HEADER

# For each new key, add INSERT OR IGNORE statement
while IFS= read -r key; do
  if [[ -z "$key" ]]; then
    continue
  fi
  
  # Escape single quotes in key for SQL
  ESCAPED_KEY=$(echo "$key" | sed "s/'/''/g")
  
  # Build URL (ensure no double slashes)
  CLEAN_KEY=$(echo "$key" | sed 's:^/*::')
  URL="${BASE_URL}/${CLEAN_KEY}"
  
  # Generate INSERT OR IGNORE
  cat >> "$SQL_FILE" <<SQL_INSERT
INSERT OR IGNORE INTO photos (photo_id, url, is_memorabilia, description)
VALUES ('${ESCAPED_KEY}', '${URL}', 0, '');
SQL_INSERT
done <<< "$NEW_KEYS"

echo "COMMIT;" >> "$SQL_FILE"

echo "Generated SQL with $NEW_COUNT INSERT statements at: $SQL_FILE"

# Step 5: Execute SQL via wrangler
echo "Executing SQL into D1 database: $D1_DATABASE_NAME"
npx wrangler d1 execute "$D1_DATABASE_NAME" --remote --file "$SQL_FILE"

# Step 6: Update snapshot
cp "$CURRENT_LISTING" "$SNAPSHOT_FILE"
echo "Snapshot updated at: $SNAPSHOT_FILE"
echo "Sync complete."
