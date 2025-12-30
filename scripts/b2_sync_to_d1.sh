#!/usr/bin/env bash
set -euo pipefail

# Requires env vars:
#   B2_KEY_ID, B2_APP_KEY, B2_ENDPOINT, B2_BUCKET, PUBLIC_B2_BASE_URL
#   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
# Optional:
#   B2_PREFIX (only sync keys under this prefix)
#   D1_DB_NAME (default: lgfc_lite)
#   DRY_RUN=1 (prints SQL, does not execute)

D1_DB_NAME="${D1_DB_NAME:-lgfc_lite}"
B2_PREFIX="${B2_PREFIX:-}"

if [[ -z "${B2_KEY_ID:-}" || -z "${B2_APP_KEY:-}" || -z "${B2_ENDPOINT:-}" || -z "${B2_BUCKET:-}" || -z "${PUBLIC_B2_BASE_URL:-}" ]]; then
  echo "Missing required B2 env vars (B2_KEY_ID/B2_APP_KEY/B2_ENDPOINT/B2_BUCKET/PUBLIC_B2_BASE_URL)" >&2
  exit 2
fi

# Configure AWS CLI for B2 S3
export AWS_ACCESS_KEY_ID="$B2_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$B2_APP_KEY"
export AWS_EC2_METADATA_DISABLED=true
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

WORKDIR="${WORKDIR:-/tmp/lgfc-b2-sync}"
mkdir -p "$WORKDIR"

LIST_JSON="$WORKDIR/objects.json"
SQL_FILE="$WORKDIR/photos_upsert.sql"

echo "Listing B2 objects from bucket: $B2_BUCKET (prefix='$B2_PREFIX')"
node scripts/b2_list_objects.mjs > "$LIST_JSON"

echo "Building D1 upsert SQL"
node scripts/b2_build_upsert_sql.mjs "$LIST_JSON" > "$SQL_FILE"

if [[ "${DRY_RUN:-}" == "1" ]]; then
  echo "DRY_RUN=1; not executing wrangler. SQL written to: $SQL_FILE"
  exit 0
fi

echo "Executing SQL into D1 ($D1_DB_NAME) via wrangler (remote)"
npx wrangler d1 execute "$D1_DB_NAME" --remote --file "$SQL_FILE"
echo "Done."
