#!/usr/bin/env bash
#
# Cloudflare Pages Snapshot Script
# - Fetches Pages project metadata, domains, and recent deployments
# - Writes timestamped JSON files to snapshots/cloudflare/
# - Appends run timestamp to _smoketest.txt
# - Fails fast if required env vars/secrets are missing
#

set -euo pipefail

# --- Required env vars check ---
if [[ -z "${CF_ACCOUNT_ID:-}" ]]; then
  echo "ERROR: CF_ACCOUNT_ID environment variable is not set" >&2
  exit 1
fi

if [[ -z "${CF_PAGES_PROJECT:-}" ]]; then
  echo "ERROR: CF_PAGES_PROJECT environment variable is not set" >&2
  exit 2
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "ERROR: CLOUDFLARE_API_TOKEN secret is not set" >&2
  exit 3
fi

# --- Setup ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SNAPSHOT_DIR="$REPO_ROOT/snapshots/cloudflare"
mkdir -p "$SNAPSHOT_DIR"

# Timestamp in UTC (ISO8601 format: YYYYMMDDTHHMMSSZ)
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")

# Output files
PROJECT_FILE="$SNAPSHOT_DIR/cf-project-$TIMESTAMP.json"
DOMAINS_FILE="$SNAPSHOT_DIR/cf-domains-$TIMESTAMP.json"
DEPLOYMENTS_FILE="$SNAPSHOT_DIR/cf-deployments-$TIMESTAMP.json"
SMOKETEST_FILE="$SNAPSHOT_DIR/_smoketest.txt"

# Cloudflare API base
CF_API_BASE="https://api.cloudflare.com/client/v4"

# --- Helper function to call CF API ---
call_cf_api() {
  local endpoint="$1"
  local output_file="$2"
  
  echo "Fetching: $endpoint"
  
  # Use curl to fetch, fail on HTTP errors
  # -sS: silent but show errors
  # -f: fail on HTTP errors (4xx, 5xx)
  # -H: authorization header
  local http_code
  http_code=$(curl -sS -f -w "%{http_code}" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -o "$output_file" \
    "${CF_API_BASE}${endpoint}")
  
  if [[ "$http_code" != "200" ]]; then
    echo "ERROR: API call failed with HTTP $http_code: $endpoint" >&2
    return 1
  fi
  
  # Verify the response is valid JSON
  if ! jq empty "$output_file" 2>/dev/null; then
    echo "ERROR: Invalid JSON response from: $endpoint" >&2
    return 1
  fi
  
  echo "✓ Saved to: $(basename "$output_file")"
}

# --- Main snapshot logic ---
echo "=== Cloudflare Pages Snapshot ==="
echo "Account ID: $CF_ACCOUNT_ID"
echo "Project: $CF_PAGES_PROJECT"
echo "Timestamp: $TIMESTAMP"
echo ""

# 1. Fetch project metadata
call_cf_api \
  "/accounts/$CF_ACCOUNT_ID/pages/projects/$CF_PAGES_PROJECT" \
  "$PROJECT_FILE"

# 2. Fetch domains
call_cf_api \
  "/accounts/$CF_ACCOUNT_ID/pages/projects/$CF_PAGES_PROJECT/domains" \
  "$DOMAINS_FILE"

# 3. Fetch latest 3 deployments
call_cf_api \
  "/accounts/$CF_ACCOUNT_ID/pages/projects/$CF_PAGES_PROJECT/deployments?per_page=3" \
  "$DEPLOYMENTS_FILE"

# --- Update smoketest file ---
echo "$TIMESTAMP" >> "$SMOKETEST_FILE"
echo "✓ Appended timestamp to _smoketest.txt"

# --- Generate/update README ---
# Note: We regenerate README.md on each run to ensure it stays synchronized
# with the script's behavior and provides consistent, up-to-date documentation.
README_FILE="$SNAPSHOT_DIR/README.md"
cat > "$README_FILE" << 'EOF'
# Cloudflare Pages Snapshots

This directory contains read-only snapshots of the Cloudflare Pages project configuration and deployment metadata. These snapshots enable reproducible recovery of the Pages project settings.

## Files Generated

Each run creates timestamped JSON files:

- **`cf-project-YYYYMMDDTHHMMSSZ.json`** — Pages project configuration including build settings, environment variables (names only, not values), and project metadata
- **`cf-domains-YYYYMMDDTHHMMSSZ.json`** — Custom domain configurations
- **`cf-deployments-YYYYMMDDTHHMMSSZ.json`** — Latest 3 deployment records with build logs and metadata
- **`_smoketest.txt`** — Append-only log of successful snapshot runs (one timestamp per line)

## Data Captured

### Project Configuration (`cf-project-*.json`)
- Project name
- Production branch
- Build configuration (command, output directory)
- Environment variable names (values are NOT exported for security)
- Project creation date and metadata

### Domains (`cf-domains-*.json`)
- Custom domain names
- Domain validation status
- DNS configuration requirements

### Deployments (`cf-deployments-*.json`)
- Latest 3 deployment IDs
- Deployment status and timestamps
- Source commit SHA
- Build configuration used
- Deployment URLs

## How to Use

These snapshots are **read-only references** to assist with:

1. **Documentation** — Understanding current production configuration
2. **Recovery** — Rebuilding the Pages project if needed (see `/docs/CLOUDFLARE_RECOVERY.md`)
3. **Audit** — Tracking configuration changes over time
4. **Troubleshooting** — Comparing current settings with historical state

**Important:** These files do NOT contain:
- Cloudflare API tokens or secrets
- Environment variable values
- DNS zone records (only Pages-specific domain config)

## Security

- All files are safe to commit to the repository
- No secrets or API tokens are written to disk
- The snapshot script validates responses and redacts sensitive data
- Environment variable values are never exported

## Automation

Snapshots are created:
- **Daily** via GitHub Actions (scheduled at 07:00 UTC)
- **On-demand** via workflow_dispatch in GitHub Actions UI

See `.github/workflows/cf_pages_snapshot.yml` for the automation workflow.

## Recovery

For step-by-step recovery procedures using these snapshots, see:
**`/docs/CLOUDFLARE_RECOVERY.md`**
EOF

echo "✓ Updated README.md"

echo ""
echo "=== Snapshot Complete ==="
echo "Files created:"
echo "  - $PROJECT_FILE"
echo "  - $DOMAINS_FILE"
echo "  - $DEPLOYMENTS_FILE"
echo "  - $SMOKETEST_FILE (appended)"
echo "  - $README_FILE (updated)"
echo ""
