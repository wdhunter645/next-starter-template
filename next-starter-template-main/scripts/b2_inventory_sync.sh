#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# B2 Inventory Sync Script
# ============================================================================
# Purpose: Enumerate objects in Backblaze B2 bucket via S3-compatible API
#          and emit a normalized inventory for downstream processing.
#
# Required environment variables:
#   B2_KEY_ID       - Backblaze B2 application key ID
#   B2_APP_KEY      - Backblaze B2 application key
#   B2_ENDPOINT     - B2 S3-compatible endpoint URL
#   B2_BUCKET       - B2 bucket name
#
# Output: JSON inventory written to stdout
#         Format: {"objects": [{"key": "...", "size": N, "last_modified": "...", "etag": "...", "file_id": "..."}]}
# ============================================================================

# Validate required environment variables
REQUIRED_VARS=("B2_KEY_ID" "B2_APP_KEY" "B2_ENDPOINT" "B2_BUCKET")
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

# Log to stderr so stdout remains clean JSON
log() {
  echo "$@" >&2
}

log "Listing B2 objects from bucket: $B2_BUCKET"

# Initialize accumulator for all objects
ALL_OBJECTS='[]'
CONTINUATION_TOKEN=""
PAGE=0

# Paginate through all objects in the bucket
while true; do
  PAGE=$((PAGE + 1))
  log "Fetching page $PAGE..."
  
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
  
  # Execute AWS CLI and capture response
  if ! RESPONSE=$(aws "${AWS_ARGS[@]}" 2>&1); then
    log "ERROR: Failed to list B2 objects"
    log "$RESPONSE"
    exit 1
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

# Transform to normalized inventory format
# Note: B2 file_id is stored in VersionId field when versioning is enabled
# For non-versioned buckets, we use the ETag as a surrogate identifier
INVENTORY=$(echo "$ALL_OBJECTS" | jq '{
  objects: [
    .[] | {
      key: .Key,
      size: .Size,
      last_modified: .LastModified,
      etag: .ETag,
      file_id: (.VersionId // .ETag)
    }
  ]
}')

TOTAL=$(echo "$INVENTORY" | jq '.objects | length')
log "Total objects discovered: $TOTAL"

# Output inventory to stdout
echo "$INVENTORY"
