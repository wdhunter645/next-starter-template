#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# B2 → D1 Photo Sync Script (LGFC-Lite)
# ============================================================================
# Purpose: End-to-end pipeline to sync B2 inventory to D1 photos table
# 
# Pipeline:
#   1. Run B2 inventory report
#   2. Enrich inventory with metadata
#   3. Generate SQL seed file
#   4. Execute SQL via wrangler
#   5. Verify D1 photos count
#
# Required env vars:
#   B2_KEY_ID, B2_APP_KEY, B2_ENDPOINT, B2_BUCKET, PUBLIC_B2_BASE_URL
#   CLOUDFLARE_API_TOKEN (or CF_API_TOKEN), CLOUDFLARE_ACCOUNT_ID (or CF_ACCOUNT_ID)
#
# Optional env vars:
#   D1_DB_NAME (default: lgfc_lite)
#
# Required tools:
#   bash, node, wrangler, aws, jq, python3
#
# Output:
#   - Logs: .tmp/b2_sync_*.log
#   - SQL: .tmp/seed_photos.sql
#   - Inventory: data/b2/inventory*.{json,csv}
#   - Enriched: data/b2/inventory_enriched.json
# ============================================================================

echo "============================================"
echo "B2 → D1 Photo Sync Pipeline"
echo "============================================"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Setup logging
LOG_DIR="${REPO_ROOT}/.tmp"
mkdir -p "${LOG_DIR}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="${LOG_DIR}/b2_sync_${TIMESTAMP}.log"

# Log function
log() {
  echo "$@" | tee -a "${LOG_FILE}"
}

log "Started: ${TIMESTAMP}"
log "Log file: ${LOG_FILE}"
log ""

# ============================================================================
# 1. Validate Required Environment Variables
# ============================================================================

log "Step 1: Validating environment variables..."

REQUIRED_ENV_VARS=(
  "B2_KEY_ID"
  "B2_APP_KEY"
  "B2_ENDPOINT"
  "B2_BUCKET"
  "PUBLIC_B2_BASE_URL"
)

MISSING_VARS=()
for var in "${REQUIRED_ENV_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    MISSING_VARS+=("${var}")
  fi
done

# Handle Cloudflare API token (accept either CLOUDFLARE_API_TOKEN or CF_API_TOKEN)
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  if [[ -n "${CF_API_TOKEN:-}" ]]; then
    export CLOUDFLARE_API_TOKEN="${CF_API_TOKEN}"
  else
    MISSING_VARS+=("CLOUDFLARE_API_TOKEN (or CF_API_TOKEN)")
  fi
fi

# Handle Cloudflare Account ID (accept either CLOUDFLARE_ACCOUNT_ID or CF_ACCOUNT_ID)
if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  if [[ -n "${CF_ACCOUNT_ID:-}" ]]; then
    export CLOUDFLARE_ACCOUNT_ID="${CF_ACCOUNT_ID}"
  else
    MISSING_VARS+=("CLOUDFLARE_ACCOUNT_ID (or CF_ACCOUNT_ID)")
  fi
fi

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
  log "ERROR: Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    log "  - ${var}"
  done
  log ""
  log "Please set these variables in .env or export them before running this script."
  exit 2
fi

log "✓ All required environment variables are set"
log ""

# Set D1 database name (default: lgfc_lite)
D1_DB_NAME="${D1_DB_NAME:-lgfc_lite}"
log "D1 Database: ${D1_DB_NAME}"
log ""

# ============================================================================
# 2. Validate Required Tools
# ============================================================================

log "Step 2: Validating required tools..."

REQUIRED_TOOLS=(
  "bash"
  "node"
  "aws"
  "jq"
  "python3"
)

MISSING_TOOLS=()
for tool in "${REQUIRED_TOOLS[@]}"; do
  if ! command -v "${tool}" >/dev/null 2>&1; then
    MISSING_TOOLS+=("${tool}")
  fi
done

# Check for wrangler (npx wrangler)
if ! command -v wrangler >/dev/null 2>&1 && ! command -v npx >/dev/null 2>&1; then
  MISSING_TOOLS+=("wrangler (or npx)")
fi

if [[ ${#MISSING_TOOLS[@]} -gt 0 ]]; then
  log "ERROR: Missing required tools:"
  for tool in "${MISSING_TOOLS[@]}"; do
    log "  - ${tool}"
  done
  log ""
  log "Please install these tools before running this script."
  exit 2
fi

log "✓ All required tools are available"
log ""

# Determine wrangler command
if command -v wrangler >/dev/null 2>&1; then
  WRANGLER_CMD="wrangler"
else
  WRANGLER_CMD="npx wrangler"
fi

# ============================================================================
# 3. Run B2 Inventory Report
# ============================================================================

log "Step 3: Running B2 inventory report..."

INVENTORY_SCRIPT="${SCRIPT_DIR}/b2_inventory_report.sh"
if [[ ! -f "${INVENTORY_SCRIPT}" ]]; then
  log "ERROR: Inventory script not found: ${INVENTORY_SCRIPT}"
  exit 2
fi

if ! bash "${INVENTORY_SCRIPT}" 2>&1 | tee -a "${LOG_FILE}"; then
  log "ERROR: B2 inventory report failed"
  exit 1
fi

log ""

# ============================================================================
# 4. Enrich Inventory
# ============================================================================

log "Step 4: Enriching inventory with metadata..."

ENRICH_SCRIPT="${SCRIPT_DIR}/b2_enrich_inventory.sh"
if [[ ! -f "${ENRICH_SCRIPT}" ]]; then
  log "ERROR: Enrichment script not found: ${ENRICH_SCRIPT}"
  exit 2
fi

ENRICHED_JSON="${REPO_ROOT}/data/b2/inventory_enriched.json"

if ! bash "${ENRICH_SCRIPT}" 2>&1 | tee -a "${LOG_FILE}"; then
  log "ERROR: Inventory enrichment failed"
  exit 1
fi

if [[ ! -f "${ENRICHED_JSON}" ]]; then
  log "ERROR: Enriched inventory not found: ${ENRICHED_JSON}"
  exit 1
fi

log ""

# ============================================================================
# 5. Generate D1 Seed SQL
# ============================================================================

log "Step 5: Generating D1 seed SQL from enriched inventory..."

SEED_SQL="${LOG_DIR}/seed_photos.sql"
CONVERTER_SCRIPT="${SCRIPT_DIR}/b2_inventory_to_d1_seed.mjs"

if [[ ! -f "${CONVERTER_SCRIPT}" ]]; then
  log "ERROR: Converter script not found: ${CONVERTER_SCRIPT}"
  exit 2
fi

if ! node "${CONVERTER_SCRIPT}" "${ENRICHED_JSON}" "${SEED_SQL}" 2>&1 | tee -a "${LOG_FILE}"; then
  log "ERROR: SQL generation failed"
  exit 1
fi

if [[ ! -f "${SEED_SQL}" ]]; then
  log "ERROR: Seed SQL file not created: ${SEED_SQL}"
  exit 1
fi

log ""

# ============================================================================
# 6. Execute SQL via Wrangler
# ============================================================================

log "Step 6: Executing SQL into D1 database (${D1_DB_NAME})..."

if ! ${WRANGLER_CMD} d1 execute "${D1_DB_NAME}" --remote --file "${SEED_SQL}" 2>&1 | tee -a "${LOG_FILE}"; then
  log "ERROR: Wrangler D1 execute failed"
  exit 1
fi

log ""

# ============================================================================
# 7. Verify D1 Photos Count
# ============================================================================

log "Step 7: Verifying D1 photos count..."

PHOTOS_COUNT=$(${WRANGLER_CMD} d1 execute "${D1_DB_NAME}" --remote --command "SELECT COUNT(*) as count FROM photos;" --json 2>&1 | tee -a "${LOG_FILE}" | jq -r '.[0].results[0].count // 0' 2>/dev/null || echo "0")

log ""
log "============================================"
log "Sync Complete!"
log "============================================"
log "Photos in D1: ${PHOTOS_COUNT}"
log "Log: ${LOG_FILE}"
log "SQL: ${SEED_SQL}"
log "============================================"

if [[ "${PHOTOS_COUNT}" -eq 0 ]]; then
  log "WARNING: No photos found in D1 after sync"
  exit 1
fi
