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

# Normalize endpoint
ENDPOINT="${B2_ENDPOINT}"
if [[ "${ENDPOINT}" != https://* && "${ENDPOINT}" != http://* ]]; then
  ENDPOINT="https://${ENDPOINT}"
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: aws CLI is required but not installed." >&2
  exit 2
fi

echo "✓ Environment variables validated"
echo "✓ Testing connectivity to B2 bucket via S3 endpoint..."
echo "  - Endpoint: ${ENDPOINT}"
echo "  - Bucket: ${B2_BUCKET}"

# Use dedicated temp config so we don't mutate any runner/user config
TMPDIR="$(mktemp -d)"
cleanup() { rm -rf "${TMPDIR}"; }
trap cleanup EXIT

export AWS_ACCESS_KEY_ID="${B2_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${B2_APP_KEY}"

# Region is ignored by B2 S3, but aws CLI may require a value in some contexts
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

set +e
OUT="$(
  aws s3api list-objects-v2     --bucket "${B2_BUCKET}"     --max-keys 1     --endpoint-url "${ENDPOINT}"     --output json 2>&1
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
