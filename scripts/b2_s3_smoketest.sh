#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# B2 S3 Smoke Test
# ============================================================================
# Purpose: Validate GitHub Actions connectivity to Backblaze B2 via S3-
#          compatible endpoint. Fails fast if credentials, endpoint, or
#          bucket are misconfigured.
#
# Required env vars:
#   B2_BUCKET    - Backblaze B2 bucket name
#   B2_ENDPOINT  - S3-compatible endpoint (e.g., https://s3.us-west-002.backblazeb2.com)
#   B2_KEY_ID    - B2 application key ID
#   B2_APP_KEY   - B2 application key
#
# Output:
#   - Success or failure status
#   - Number of objects returned (0-5)
#   - No secret values are logged
#
# Exit codes:
#   0 - Success
#   1 - Missing environment variable or connectivity failure
# ============================================================================

echo "============================================"
echo "B2 S3 Smoke Test"
echo "============================================"
echo ""

# Validate required environment variables
REQUIRED_VARS=(
  "B2_BUCKET"
  "B2_ENDPOINT"
  "B2_KEY_ID"
  "B2_APP_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    MISSING_VARS+=("$var")
  fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
  echo "ERROR: Missing required environment variables:" >&2
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var" >&2
  done
  echo "" >&2
  echo "Please ensure all required secrets are configured in GitHub repository settings." >&2
  exit 1
fi

# Configure AWS CLI for B2 S3 compatibility
export AWS_ACCESS_KEY_ID="$B2_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$B2_APP_KEY"
export AWS_EC2_METADATA_DISABLED=true
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo "✓ Environment variables validated"
echo "✓ Testing connectivity to B2 bucket via S3 endpoint..."
echo ""

# Attempt to list objects from B2 bucket (max 5 objects)
# This validates:
# - Endpoint is reachable
# - Credentials are valid
# - Bucket exists and is accessible
if ! RESPONSE=$(aws --endpoint-url "$B2_ENDPOINT" s3api list-objects-v2 \
  --bucket "$B2_BUCKET" \
  --max-keys 5 2>&1); then
  echo "ERROR: Failed to connect to B2 bucket" >&2
  echo "" >&2
  echo "AWS CLI output:" >&2
  echo "$RESPONSE" >&2
  echo "" >&2
  echo "Please verify:" >&2
  echo "  - B2_ENDPOINT is correct (format: https://s3.<region>.backblazeb2.com)" >&2
  echo "  - B2_BUCKET name is correct" >&2
  echo "  - B2_KEY_ID and B2_APP_KEY are valid and have read permissions" >&2
  exit 1
fi

# Count objects returned
OBJECT_COUNT=$(echo "$RESPONSE" | jq -r '.Contents | length // 0')

echo "============================================"
echo "✓ SUCCESS: B2 S3 connectivity verified"
echo "============================================"
echo ""
echo "Bucket: $B2_BUCKET"
echo "Objects sampled: $OBJECT_COUNT (max 5)"
echo ""
echo "B2 S3 endpoint is reachable and credentials are valid."
echo ""

exit 0
