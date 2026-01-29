#!/usr/bin/env bash
set -euo pipefail

# Interactive B2 CLI setup and verification script
# 
# Purpose:
#   - Checks for B2 CLI presence and installs if needed
#   - Interactively prompts for B2 credentials (KEY ID and APPLICATION KEY)
#   - Authorizes with Backblaze B2
#   - Displays account info and lists accessible buckets
#   - Optionally lists files in a bucket for sanity check
#
# Usage:
#   ./scripts/b2_cli_setup.sh
#
# Security notes:
#   - Application key input is hidden (not echoed to terminal)
#   - Credentials are immediately scrubbed from shell memory after use
#   - Authorization output is suppressed to avoid accidental credential exposure

echo "== B2 CLI presence check =="
if command -v b2 >/dev/null 2>&1; then
  echo "b2 CLI found: $(b2 version 2>/dev/null || echo 'version unknown')"
else
  echo "b2 CLI not found. Installing (user-local) via pip..."
  python3 -m pip install --user --upgrade b2 >/dev/null
  export PATH="$HOME/.local/bin:$PATH"
  echo "b2 CLI installed: $(b2 version 2>/dev/null || echo 'version unknown')"
fi

echo
echo "== B2 auth (keys NOT echoed) =="
echo "Paste your B2 KEY ID, then press Enter:"
read -r B2_KEY_ID
echo "Paste your B2 APPLICATION KEY (input hidden), then press Enter:"
read -rs B2_APP_KEY
echo

# Authorize (do not echo secrets)
b2 authorize-account "$B2_KEY_ID" "$B2_APP_KEY" >/dev/null

# Immediately scrub variables from shell memory as best-effort
unset B2_KEY_ID B2_APP_KEY

echo "Authorized. Account info:"
b2 get-account-info | sed -n '1,120p'

echo
echo "== Buckets visible to this key =="
b2 list-buckets | sed -n '1,200p'

echo
echo "== Optional: quick sanity list of first 20 files in a bucket =="
echo "Enter the bucket name to test (or just press Enter to skip):"
read -r BUCKET_NAME
if [ -n "${BUCKET_NAME}" ]; then
  b2 ls "$BUCKET_NAME" --long --maxFileCount 20 | sed -n '1,200p'
  echo
  echo "✅ Connectivity confirmed and read access works."
else
  echo "Skipped bucket file listing. ✅ Auth + bucket access confirmed."
fi
