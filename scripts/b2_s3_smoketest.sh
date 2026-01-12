#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "B2 S3 Smoke Test"
echo "============================================"

require() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "ERROR: Missing required env var: ${name}" >&2
    exit 2
  fi
}

require B2_KEY_ID
require B2_APP_KEY
require B2_ENDPOINT
require B2_BUCKET

# Validate B2_ENDPOINT format
if [[ "${B2_ENDPOINT}" != https://* ]]; then
  echo "ERROR: B2_ENDPOINT must start with https:// (got: ${B2_ENDPOINT})" >&2
  exit 2
fi

# Derive AWS region from B2_ENDPOINT
# Expected format: https://s3.<region>.backblazeb2.com
# Extract region from hostname
ENDPOINT_HOST="${B2_ENDPOINT#https://}"
ENDPOINT_HOST="${ENDPOINT_HOST%%/*}"
# Extract region from s3.<region>.backblazeb2.com pattern
if [[ "$ENDPOINT_HOST" =~ ^s3\.([^.]+)\.backblazeb2\.com$ ]]; then
  DERIVED_REGION="${BASH_REMATCH[1]}"
  export AWS_DEFAULT_REGION="$DERIVED_REGION"
  echo "✓ Derived AWS region from endpoint: ${DERIVED_REGION}"
else
  echo "ERROR: Could not extract region from B2_ENDPOINT format" >&2
  echo "  Expected: https://s3.<region>.backblazeb2.com" >&2
  echo "  Got: ${B2_ENDPOINT}" >&2
  exit 2
fi

# Normalize endpoint
ENDPOINT="${B2_ENDPOINT}"

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: aws CLI is required but not installed." >&2
  exit 2
fi

echo "✓ Environment variables validated"
echo "✓ Testing connectivity to B2 bucket via S3 endpoint..."
echo "  - Endpoint: ${ENDPOINT}"
echo "  - Bucket: ${B2_BUCKET}"
echo "B2_KEY_ID length: ${#B2_KEY_ID}"
echo "B2_ENDPOINT host: $(echo "$B2_ENDPOINT" | sed -E 's#^https?://##' | cut -d/ -f1)"

# Use dedicated temp config so we don't mutate any runner/user config
TMPDIR="$(mktemp -d)"
cleanup() { rm -rf "${TMPDIR}"; }
trap cleanup EXIT

export AWS_ACCESS_KEY_ID="${B2_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${B2_APP_KEY}"
export AWS_EC2_METADATA_DISABLED=true

# AWS_DEFAULT_REGION already set above from endpoint derivation
export AWS_ENDPOINT_URL="${B2_ENDPOINT}"

set +e
OUT="$(
  aws s3api list-objects-v2 \
    --bucket "${B2_BUCKET}" \
    --max-keys 1 \
    --endpoint-url "${ENDPOINT}" \
    --output json 2>&1
)"
RC=$?
set -e

if [[ $RC -ne 0 ]]; then
  echo ""
  echo "ERROR: Failed to connect to B2 bucket"
  echo ""
  echo "AWS CLI output:"
  echo ""
  echo "${OUT}"
  echo ""
  echo "Common causes:"
  echo "  - Endpoint mismatch (bucket region vs B2_ENDPOINT)"
  echo "  - B2_ENDPOINT missing/incorrect (must be Backblaze S3 endpoint, not AWS)"
  echo "  - Key ID / App Key invalid, revoked, or missing permissions (list bucket)"
  echo ""
  echo "Expected endpoint format:"
  echo "  https://s3.<region>.backblazeb2.com"
  exit 1
fi

echo "✓ B2 connectivity OK"
