#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "B2 Inventory Report"
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

ENDPOINT="${B2_ENDPOINT}"
if [[ "${ENDPOINT}" != https://* && "${ENDPOINT}" != http://* ]]; then
  ENDPOINT="https://${ENDPOINT}"
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: aws CLI is required but not installed." >&2
  exit 2
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required but not installed." >&2
  exit 2
fi

export AWS_ACCESS_KEY_ID="${B2_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${B2_APP_KEY}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

OUT_DIR="data/b2"
mkdir -p "${OUT_DIR}"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
JSON_OUT="${OUT_DIR}/inventory_${STAMP}.json"
CSV_OUT="${OUT_DIR}/inventory_${STAMP}.csv"
LATEST_JSON="${OUT_DIR}/inventory.json"
LATEST_CSV="${OUT_DIR}/inventory.csv"

PUBLIC_BASE="${PUBLIC_B2_BASE_URL:-${PUBLIC_B2_BASE_URL:-}}"
# Normalize PUBLIC base if provided
if [[ -n "${PUBLIC_BASE}" && "${PUBLIC_BASE}" != http* ]]; then
  PUBLIC_BASE="https://${PUBLIC_BASE}"
fi
if [[ -n "${PUBLIC_BASE}" && "${PUBLIC_BASE: -1}" != "/" ]]; then
  PUBLIC_BASE="${PUBLIC_BASE}/"
fi

echo "✓ Listing objects from s3://${B2_BUCKET} (via ${ENDPOINT})"

TOKEN=""
ALL="[]"

while : ; do
  if [[ -z "${TOKEN}" ]]; then
    RESP="$(aws s3api list-objects-v2 --bucket "${B2_BUCKET}" --max-keys 1000 --endpoint-url "${ENDPOINT}" --output json)"
  else
    RESP="$(aws s3api list-objects-v2 --bucket "${B2_BUCKET}" --max-keys 1000 --continuation-token "${TOKEN}" --endpoint-url "${ENDPOINT}" --output json)"
  fi

  PAGE="$(echo "${RESP}" | jq -c '.Contents // [] | map({key:.Key,size:.Size,last_modified:.LastModified,etag:.ETag})')"
  ALL="$(jq -c --argjson page "${PAGE}" '$ARGS.positional[0] + $page' <<<"${ALL}" --args)"
  TOKEN="$(echo "${RESP}" | jq -r '.NextContinuationToken // empty')"

  if [[ -z "${TOKEN}" ]]; then
    break
  fi
done

COUNT="$(echo "${ALL}" | jq 'length')"
echo "✓ Objects found: ${COUNT}"

# Attach url field if PUBLIC_B2_BASE_URL is available
if [[ -n "${PUBLIC_BASE}" ]]; then
  ALL="$(echo "${ALL}" | jq -c --arg base "${PUBLIC_BASE}" 'map(. + {url: ($base + (.key|@uri))})')"
else
  ALL="$(echo "${ALL}" | jq -c 'map(. + {url: null})')"
fi

# Write JSON (versioned + latest)
jq -c --arg stamp "${STAMP}" '{generated_at:$stamp, objects:.}' <<<"${ALL}" > "${JSON_OUT}"
cp -f "${JSON_OUT}" "${LATEST_JSON}"

# Write CSV (versioned + latest)
{
  echo "key,size,last_modified,etag,url"
  echo "${ALL}" | jq -r '.[] | [(.key), (.size|tostring), (.last_modified // ""), (.etag // ""), (.url // "")] | @csv'
} > "${CSV_OUT}"
cp -f "${CSV_OUT}" "${LATEST_CSV}"

echo "✓ Wrote:"
echo "  - ${JSON_OUT}"
echo "  - ${CSV_OUT}"
echo "  - ${LATEST_JSON} (latest)"
echo "  - ${LATEST_CSV} (latest)"
