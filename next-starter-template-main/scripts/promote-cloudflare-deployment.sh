#!/usr/bin/env bash
set -euo pipefail

# Usage: provide env vars or pass them in the environment
# Requires: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_PROJECT_NAME, TARGET_SHA

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] || [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ] || [ -z "${CLOUDFLARE_PROJECT_NAME:-}" ] || [ -z "${TARGET_SHA:-}" ]; then
  echo "Missing required environment variables. Ensure CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_PROJECT_NAME, and TARGET_SHA are set."
  exit 2
fi

API_BASE="https://api.cloudflare.com/client/v4"
PROJECT_API_PATH="/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT_NAME}"

echo "Listing recent deployments for project ${CLOUDFLARE_PROJECT_NAME}..."
resp=$(curl -sS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Accept: application/json" "${API_BASE}${PROJECT_API_PATH}/deployments?per_page=50") || { echo "Failed to call Cloudflare API"; exit 3; }

ok=$(echo "$resp" | jq -r '.success')
if [ "$ok" != "true" ]; then
  echo "Cloudflare API returned failure:" >&2
  echo "$resp" | jq -r '.errors[]?.message // .'
  exit 4
fi

# find deployment matching the TARGET_SHA in the 'deployment.metadata.git_commit' or metadata fields
deployment_id=$(echo "$resp" | jq -r --arg sha "$TARGET_SHA" '.result[] | select(.deployment_metadata?.commit_sha? == $sha or .metadata?.git?.commit_sha? == $sha or .metadata?.git.commit?.sha? == $sha or .git_metadata?.commit_hash? == $sha) | .id' | head -n1 || true)

# If jq path above doesn't match real API responses, also attempt to match by "github_commit_ref" or "source" fields
if [ -z "$deployment_id" ]; then
  deployment_id=$(echo "$resp" | jq -r --arg sha "$TARGET_SHA" '.result[] | select((.deployment_metadata // {} ) | tostring | contains($sha)) | .id' | head -n1 || true)
fi

if [ -z "$deployment_id" ]; then
  echo "No deployment found for commit SHA $TARGET_SHA"
  echo "Recent deployments (id | created_on | sha candidate):"
  echo "$resp" | jq -r '.result[] | [(.id//""), (.created_on//""), ((.deployment_metadata?.commit_sha // .metadata?.git?.commit?.sha // .git_metadata?.commit_hash) // "-")] | @tsv' | nl -ba
  exit 5
fi

echo "Found deployment id: $deployment_id for sha $TARGET_SHA"

# Try to restore/promote this deployment. Cloudflare Pages API supports a "restore" action for a deployment id.
promote_resp=$(curl -sS -X POST -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" "${API_BASE}${PROJECT_API_PATH}/deployments/${deployment_id}/restore") || { echo "Failed to call restore endpoint"; exit 6; }

promote_ok=$(echo "$promote_resp" | jq -r '.success')
if [ "$promote_ok" = "true" ]; then
  echo "Promotion succeeded. Deployment ${deployment_id} promoted/restored."
  echo "$promote_resp" | jq -r '.result | {id: .id, url: .url, created_on: .created_on}'
  exit 0
else
  echo "Promotion API returned failure:" >&2
  echo "$promote_resp" | jq -r '.errors[]?.message // .'
  exit 7
fi
