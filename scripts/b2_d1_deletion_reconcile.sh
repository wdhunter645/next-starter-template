#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# B2 → D1 Deletion Reconciliation (#2519)
# ============================================================================
# Detects photos rows whose object key is absent from B2 and retires them from
# public selection (is_matchup_eligible = -1 + PURGE_ELIGIBLE rights note).
#
# This is the governed reverse of additive incremental sync: B2 remains canonical
# blob store; D1 rows are soft-retired (not hard-deleted) to preserve historical
# matchup references.
#
# Required env vars: same as scripts/b2_d1_incremental_sync.sh
# Optional:
#   DRY_RUN=1
#   D1_BATCH_SIZE=250
# ============================================================================

log() { echo "[b2_d1_deletion_reconcile] $*" >&2; }

require_cmd() {
  local c="$1"
  if ! command -v "$c" >/dev/null 2>&1; then
    log "ERROR: Missing required command: $c"
    exit 90
  fi
}

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
require_cmd npx

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" && -n "${CF_API_TOKEN:-}" ]]; then
  export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"
fi
if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" && -n "${CF_ACCOUNT_ID:-}" ]]; then
  export CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID"
fi
if [[ -z "${D1_DATABASE_NAME:-}" ]]; then
  if [[ -n "${D1_DATABASE_ID:-}" ]]; then
    export D1_DATABASE_NAME="$D1_DATABASE_ID"
  else
    export D1_DATABASE_NAME="lgfc_lite"
  fi
fi

REQUIRED_VARS=(
  "B2_ENDPOINT"
  "B2_BUCKET"
  "B2_KEY_ID"
  "B2_APP_KEY"
  "D1_DATABASE_NAME"
  "CLOUDFLARE_API_TOKEN"
  "CLOUDFLARE_ACCOUNT_ID"
)
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    log "ERROR: Required env var $var is not set"
    exit 1
  fi
done

DB_REF="$D1_DATABASE_NAME"
DRY_RUN="${DRY_RUN:-0}"
D1_BATCH_SIZE="${D1_BATCH_SIZE:-250}"

ENDPOINT_HOST="${B2_ENDPOINT#https://}"
ENDPOINT_HOST="${ENDPOINT_HOST%%/*}"
if [[ "$ENDPOINT_HOST" =~ ^s3\.([^.]+)\.backblazeb2\.com$ ]]; then
  export AWS_DEFAULT_REGION="${BASH_REMATCH[1]}"
else
  log "ERROR: B2_ENDPOINT must look like https://s3.<region>.backblazeb2.com"
  exit 2
fi

DEFAULT_PUBLIC_BASE_URL="https://${ENDPOINT_HOST}/${B2_BUCKET}"
PUBLIC_BASE_URL="${PUBLIC_B2_BASE_URL:-${DEFAULT_PUBLIC_BASE_URL}}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL%/}"

export AWS_ACCESS_KEY_ID="$B2_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$B2_APP_KEY"
export AWS_EC2_METADATA_DISABLED=true
export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID

if [[ -x "./node_modules/.bin/wrangler" ]]; then
  WRANGLER_CMD=(./node_modules/.bin/wrangler)
elif command -v wrangler >/dev/null 2>&1; then
  WRANGLER_CMD=(wrangler)
else
  WRANGLER_CMD=(npx --no-install wrangler)
fi

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

OBJECTS_FILE="$WORKDIR/b2_objects.json"
EXISTING_KEYS_FILE="$WORKDIR/existing_keys.txt"
B2_KEYS_FILE="$WORKDIR/b2_keys.txt"
STALE_KEYS_FILE="$WORKDIR/stale_keys.txt"
SQL_FILE="$WORKDIR/retire.sql"
SQL_DIR="$WORKDIR/sql_batches"
mkdir -p "$SQL_DIR"

wrangler_exec() {
  local mode="$1" payload="$2"
  if [[ "$mode" == "command" ]]; then
    "${WRANGLER_CMD[@]}" d1 execute "$DB_REF" --remote --command "$payload" --json 2>&1 || \
      "${WRANGLER_CMD[@]}" d1 execute "$DB_REF" --remote --command "$payload" 2>&1
    return $?
  fi
  if [[ "$mode" == "file" ]]; then
    "${WRANGLER_CMD[@]}" d1 execute "$DB_REF" --remote --file "$payload" --json 2>&1 || \
      "${WRANGLER_CMD[@]}" d1 execute "$DB_REF" --remote --file "$payload" 2>&1
    return $?
  fi
  return 99
}

sql_escape() { echo "${1//\'/\'\'}"; }

# ----------------------------------------------------------------------------
# Schema + key mode (same strategy as incremental sync)
# ----------------------------------------------------------------------------
log "Reading D1 photos schema..."
SCHEMA_OUT="$(wrangler_exec command "PRAGMA table_info(photos);")" || {
  log "ERROR: Failed PRAGMA table_info(photos)"
  exit 3
}

SCHEMA_ROWS_JSON="$(echo "$SCHEMA_OUT" | jq -c '
  [.. | arrays?] as $arrs
  | ($arrs | map(select((.[0]?|type)=="object" and (.[0]?|has("name"))))) as $cands
  | ($cands[0] // [])
' 2>/dev/null || echo "[]")"

if [[ "$SCHEMA_ROWS_JSON" == "[]" ]]; then
  SCHEMA_ROWS_JSON='[{"name":"id","type":"INTEGER"},{"name":"url","type":"TEXT"},{"name":"photo_id","type":"TEXT"},{"name":"is_matchup_eligible","type":"INTEGER"},{"name":"rights_notes","type":"TEXT"}]'
fi

has_col() { echo "$SCHEMA_ROWS_JSON" | jq -e --arg c "$1" 'map(.name==$c) | any' >/dev/null 2>&1; }
col_type() { echo "$SCHEMA_ROWS_JSON" | jq -r --arg c "$1" 'map(select(.name==$c))[0].type // ""' 2>/dev/null; }

URL_COL="url"
if ! has_col "$URL_COL"; then
  if has_col "public_url"; then URL_COL="public_url"
  elif has_col "link"; then URL_COL="link"
  else
    log "ERROR: photos table missing a URL-like column"
    exit 3
  fi
fi

KEY_COL=""
KEY_MODE=""
if has_col "photo_id" && [[ "$(col_type "photo_id" | tr '[:lower:]' '[:upper:]')" == *"TEXT"* ]]; then
  KEY_COL="photo_id"
  KEY_MODE="photo_id"
else
  KEY_COL="$URL_COL"
  KEY_MODE="url"
fi

if ! has_col "is_matchup_eligible"; then
  log "ERROR: photos.is_matchup_eligible is required for deletion reconciliation"
  exit 3
fi

HAS_RIGHTS=0
has_col "rights_notes" && HAS_RIGHTS=1

log "Using KEY_MODE=$KEY_MODE KEY_COL=$KEY_COL URL_COL=$URL_COL"

# ----------------------------------------------------------------------------
# List B2
# ----------------------------------------------------------------------------
log "Listing B2 objects from bucket: $B2_BUCKET"
ALL_OBJECTS='[]'
TOKEN=""
while true; do
  AWS_ARGS=(--endpoint-url "$B2_ENDPOINT" s3api list-objects-v2 --bucket "$B2_BUCKET" --max-keys 1000)
  [[ -n "$TOKEN" ]] && AWS_ARGS+=(--continuation-token "$TOKEN")

  RESPONSE="$(aws "${AWS_ARGS[@]}" 2>&1)" || {
    log "ERROR: aws s3api list-objects-v2 failed"
    log "$RESPONSE"
    exit 2
  }

  CONTENTS="$(echo "$RESPONSE" | jq -c '.Contents // []')"
  ALL_OBJECTS="$(echo "$ALL_OBJECTS" | jq -c --argjson n "$CONTENTS" '. + $n')"

  if [[ "$(echo "$RESPONSE" | jq -r '.IsTruncated // false')" == "true" ]]; then
    TOKEN="$(echo "$RESPONSE" | jq -r '.NextContinuationToken // ""')"
    [[ -z "$TOKEN" ]] && break
  else
    break
  fi
done

echo "$ALL_OBJECTS" | jq --arg base "$PUBLIC_BASE_URL" '{
  objects: [
    .[] | {
      external_id: .Key,
      public_url: ($base + "/" + .Key)
    }
  ]
}' > "$OBJECTS_FILE"

TOTAL_OBJECTS="$(jq '.objects | length' "$OBJECTS_FILE")"
log "Total B2 objects discovered: $TOTAL_OBJECTS"

# Safety: never retire the whole catalog if B2 enumeration is empty (auth/API failure mode).
if [[ "$TOTAL_OBJECTS" -eq 0 ]]; then
  log "ERROR: B2 inventory is empty; refusing deletion reconciliation (fail closed)."
  exit 2
fi

if [[ "$KEY_MODE" == "photo_id" ]]; then
  jq -r '.objects[].external_id' "$OBJECTS_FILE" | LC_ALL=C sort -u > "$B2_KEYS_FILE"
else
  jq -r '.objects[].public_url' "$OBJECTS_FILE" | LC_ALL=C sort -u > "$B2_KEYS_FILE"
fi

# ----------------------------------------------------------------------------
# Read eligible/unreviewed D1 keys that should be reconciled
# ----------------------------------------------------------------------------
log "Querying D1 for candidate keys (is_matchup_eligible >= 0)..."
D1_OUT="$(wrangler_exec command "SELECT \"$KEY_COL\" AS k FROM photos WHERE \"$KEY_COL\" IS NOT NULL AND TRIM(\"$KEY_COL\") != '' AND is_matchup_eligible >= 0;")" || {
  log "ERROR: Failed SELECT candidate keys"
  log "$D1_OUT"
  exit 3
}

: > "$EXISTING_KEYS_FILE"
if echo "$D1_OUT" | jq -e '.' >/dev/null 2>&1; then
  echo "$D1_OUT" | jq -r '
    [.. | arrays?] as $arrs
    | ($arrs | map(select((.[0]?|type)=="object" and (.[0]?|has("k"))))) as $cands
    | ($cands[0] // [])
    | .[]?
    | .k? // empty
  ' 2>/dev/null >> "$EXISTING_KEYS_FILE" || true
fi
if [[ ! -s "$EXISTING_KEYS_FILE" ]]; then
  echo "$D1_OUT" | grep -oE '"k"\s*:\s*"[^"]*"' | sed -E 's/.*"k"\s*:\s*"([^"]*)".*/\1/' >> "$EXISTING_KEYS_FILE" || true
fi

LC_ALL=C sort -u "$EXISTING_KEYS_FILE" | grep -v '^$' > "$EXISTING_KEYS_FILE.sorted" || true
mv "$EXISTING_KEYS_FILE.sorted" "$EXISTING_KEYS_FILE" 2>/dev/null || true
EXISTING_COUNT="$(wc -l < "$EXISTING_KEYS_FILE" | tr -d ' ')"
log "Candidate D1 key count (eligible/unreviewed): $EXISTING_COUNT"

# Keys in D1 but not in B2
comm -23 "$EXISTING_KEYS_FILE" "$B2_KEYS_FILE" > "$STALE_KEYS_FILE" || true
STALE_COUNT="$(wc -l < "$STALE_KEYS_FILE" | tr -d ' ')"
log "Stale keys to retire: $STALE_COUNT"

if [[ "$STALE_COUNT" -eq 0 ]]; then
  log "No stale D1 rows. Exit."
  log "Summary: total_b2=$TOTAL_OBJECTS candidates=$EXISTING_COUNT retired=0"
  exit 0
fi

# ----------------------------------------------------------------------------
# Build retirement SQL (soft-retire; preserve historical rows)
# ----------------------------------------------------------------------------
NOTE_BASE="PURGE_ELIGIBLE: B2 object missing during deletion reconciliation (#2519)"

cat > "$SQL_FILE" <<SQL_HEADER
-- B2 → D1 Deletion Reconciliation
-- Generated by scripts/b2_d1_deletion_reconcile.sh
SQL_HEADER

while IFS= read -r stale_key; do
  [[ -z "$stale_key" ]] && continue
  esc_key="$(sql_escape "$stale_key")"
  esc_note="$(sql_escape "$NOTE_BASE; key=$stale_key")"

  if [[ "$HAS_RIGHTS" -eq 1 ]]; then
    printf "UPDATE photos SET is_matchup_eligible = -1, rights_notes = CASE WHEN rights_notes IS NULL OR TRIM(rights_notes) = '' THEN '%s' ELSE rights_notes || ' | ' || '%s' END WHERE \"%s\" = '%s' AND is_matchup_eligible >= 0;\n" \
      "$esc_note" "$esc_note" "$KEY_COL" "$esc_key" >> "$SQL_FILE"
  else
    printf "UPDATE photos SET is_matchup_eligible = -1 WHERE \"%s\" = '%s' AND is_matchup_eligible >= 0;\n" \
      "$KEY_COL" "$esc_key" >> "$SQL_FILE"
  fi
done < "$STALE_KEYS_FILE"

# Evidence log (keys only; no secrets)
log "Stale key sample (up to 20):"
head -n 20 "$STALE_KEYS_FILE" | while IFS= read -r k; do
  log "  - $k"
done

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN=1 — printing SQL and exiting."
  cat "$SQL_FILE"
  exit 0
fi

split -d -a 4 -l "$D1_BATCH_SIZE" <(grep -E '^UPDATE[[:space:]]+photos' "$SQL_FILE") "$SQL_DIR/batch_"
TOTAL_BATCHES="$(ls -1 "$SQL_DIR"/batch_* 2>/dev/null | wc -l | tr -d ' ')"
[[ "$TOTAL_BATCHES" -eq 0 ]] && { log "ERROR: Failed to create SQL batches."; exit 4; }

for part in "$SQL_DIR"/batch_*; do
  log "Executing $(basename "$part") ..."
  OUT="$(wrangler_exec file "$part")" || {
    log "ERROR: Batch execution failed: $(basename "$part")"
    log "$OUT"
    exit 4
  }
done

log "Deletion reconciliation completed successfully"
log "Summary: total_b2=$TOTAL_OBJECTS candidates=$EXISTING_COUNT retired_attempted=$STALE_COUNT batches=$TOTAL_BATCHES key_mode=$KEY_MODE"
exit 0
