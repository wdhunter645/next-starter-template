#!/usr/bin/env bash
set -euo pipefail

# Script to review Cloudflare Pages deployment logs over the last 72 hours
# and suggest which builds should be rerun.
#
# Usage:
#   export CLOUDFLARE_API_TOKEN=your_token
#   export CLOUDFLARE_ACCOUNT_ID=your_account_id
#   export CLOUDFLARE_PROJECT_NAME=your_project_name
#   ./scripts/review-cloudflare-builds.sh
#
# Or with command line arguments:
#   ./scripts/review-cloudflare-builds.sh --api-token=TOKEN --account-id=ID --project-name=NAME

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --api-token=*)
      CLOUDFLARE_API_TOKEN="${1#*=}"
      shift
      ;;
    --account-id=*)
      CLOUDFLARE_ACCOUNT_ID="${1#*=}"
      shift
      ;;
    --project-name=*)
      CLOUDFLARE_PROJECT_NAME="${1#*=}"
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [--api-token=TOKEN] [--account-id=ID] [--project-name=NAME]"
      echo ""
      echo "Review Cloudflare Pages deployment logs over the last 72 hours"
      echo "and suggest which builds should be rerun."
      echo ""
      echo "Options:"
      echo "  --api-token=TOKEN       Cloudflare API token (or set CLOUDFLARE_API_TOKEN env var)"
      echo "  --account-id=ID         Cloudflare account ID (or set CLOUDFLARE_ACCOUNT_ID env var)"
      echo "  --project-name=NAME     Cloudflare project name (or set CLOUDFLARE_PROJECT_NAME env var)"
      echo "  --help, -h              Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check required environment variables
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN is not set"
  echo "Set it via environment variable or use --api-token=TOKEN"
  exit 1
fi

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "Error: CLOUDFLARE_ACCOUNT_ID is not set"
  echo "Set it via environment variable or use --account-id=ID"
  exit 1
fi

if [ -z "${CLOUDFLARE_PROJECT_NAME:-}" ]; then
  echo "Error: CLOUDFLARE_PROJECT_NAME is not set"
  echo "Set it via environment variable or use --project-name=NAME"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed"
  echo "Install it with: sudo apt-get install jq"
  exit 1
fi

API_BASE="https://api.cloudflare.com/client/v4"
PROJECT_API_PATH="/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT_NAME}"

# Calculate timestamp for 72 hours ago
SEVENTY_TWO_HOURS_AGO=$(date -u -d '72 hours ago' '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -v-72H '+%Y-%m-%dT%H:%M:%SZ')

echo "========================================"
echo "Cloudflare Build Log Review"
echo "========================================"
echo "Project: ${CLOUDFLARE_PROJECT_NAME}"
echo "Time Range: Last 72 hours (since ${SEVENTY_TWO_HOURS_AGO})"
echo ""

# Fetch deployments
echo "Fetching deployment history..."
resp=$(curl -sS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Accept: application/json" "${API_BASE}${PROJECT_API_PATH}/deployments?per_page=100") || {
  echo "Error: Failed to call Cloudflare API"
  exit 2
}

# Check if API call was successful
ok=$(echo "$resp" | jq -r '.success')
if [ "$ok" != "true" ]; then
  echo "Error: Cloudflare API returned failure"
  echo "$resp" | jq -r '.errors[]?.message // .'
  exit 3
fi

# Filter deployments from last 72 hours
echo "Analyzing deployments from the last 72 hours..."
echo ""

# Parse and analyze deployments
deployments=$(echo "$resp" | jq -r --arg cutoff "$SEVENTY_TWO_HOURS_AGO" '
  .result[] | 
  select(.created_at >= $cutoff) |
  {
    id: .id,
    created_at: .created_at,
    environment: .environment,
    deployment_trigger: .deployment_trigger.metadata.branch // "unknown",
    commit_hash: (.deployment_trigger.metadata.commit_hash // .deployment_metadata.commit_sha // "unknown")[0:8],
    commit_message: (.deployment_trigger.metadata.commit_message // "No message"),
    stages: .stages,
    latest_stage: .latest_stage
  }
')

if [ -z "$deployments" ]; then
  echo "No deployments found in the last 72 hours."
  exit 0
fi

# Count total deployments
total_count=$(echo "$deployments" | jq -s 'length')
echo "Found ${total_count} deployments in the last 72 hours"
echo ""

# Analyze deployment statuses
echo "========================================"
echo "Deployment Status Summary"
echo "========================================"

# Function to determine overall deployment status
analyze_deployment() {
  local deployment="$1"
  local latest_stage=$(echo "$deployment" | jq -r '.latest_stage.name // "unknown"')
  local latest_status=$(echo "$deployment" | jq -r '.latest_stage.status // "unknown"')
  
  # Check all stages for failures
  local has_failure=$(echo "$deployment" | jq -r '[.stages[] | select(.status == "failure")] | length > 0')
  local has_canceled=$(echo "$deployment" | jq -r '[.stages[] | select(.status == "canceled")] | length > 0')
  local has_skipped=$(echo "$deployment" | jq -r '[.stages[] | select(.status == "skipped")] | length > 0')
  
  if [ "$latest_status" = "success" ] && [ "$has_failure" = "false" ]; then
    echo "success"
  elif [ "$latest_status" = "active" ] || [ "$latest_status" = "queued" ]; then
    echo "in_progress"
  elif [ "$has_failure" = "true" ] || [ "$latest_status" = "failure" ]; then
    echo "failed"
  elif [ "$has_canceled" = "true" ] || [ "$latest_status" = "canceled" ]; then
    echo "canceled"
  elif [ "$has_skipped" = "true" ]; then
    echo "skipped"
  else
    echo "unknown"
  fi
}

# Arrays to store deployment IDs by status
declare -a successful_deployments=()
declare -a failed_deployments=()
declare -a canceled_deployments=()
declare -a in_progress_deployments=()
declare -a other_deployments=()

# Process each deployment
echo "$deployments" | jq -c '.' | while IFS= read -r deployment; do
  id=$(echo "$deployment" | jq -r '.id')
  created_at=$(echo "$deployment" | jq -r '.created_at')
  environment=$(echo "$deployment" | jq -r '.environment')
  branch=$(echo "$deployment" | jq -r '.deployment_trigger')
  commit_hash=$(echo "$deployment" | jq -r '.commit_hash')
  commit_message=$(echo "$deployment" | jq -r '.commit_message' | head -c 50)
  
  status=$(analyze_deployment "$deployment")
  
  case $status in
    success)
      successful_deployments+=("$id")
      ;;
    failed)
      failed_deployments+=("$id")
      ;;
    canceled)
      canceled_deployments+=("$id")
      ;;
    in_progress)
      in_progress_deployments+=("$id")
      ;;
    *)
      other_deployments+=("$id")
      ;;
  esac
  
  # Color output based on status
  case $status in
    success)
      status_color="\033[32m✓ SUCCESS\033[0m"
      ;;
    failed)
      status_color="\033[31m✗ FAILED\033[0m"
      ;;
    canceled)
      status_color="\033[33m⊘ CANCELED\033[0m"
      ;;
    in_progress)
      status_color="\033[36m⟳ IN PROGRESS\033[0m"
      ;;
    *)
      status_color="\033[90m? UNKNOWN\033[0m"
      ;;
  esac
  
  printf "${status_color} | %s | %s | %s | %s\n" \
    "$created_at" "$environment" "$commit_hash" "$commit_message"
done

# Summary counts
success_count=$(echo "$deployments" | jq -c '.' | while read -r d; do analyze_deployment "$d"; done | grep -c "^success$" || echo 0)
failed_count=$(echo "$deployments" | jq -c '.' | while read -r d; do analyze_deployment "$d"; done | grep -c "^failed$" || echo 0)
canceled_count=$(echo "$deployments" | jq -c '.' | while read -r d; do analyze_deployment "$d"; done | grep -c "^canceled$" || echo 0)
in_progress_count=$(echo "$deployments" | jq -c '.' | while read -r d; do analyze_deployment "$d"; done | grep -c "^in_progress$" || echo 0)

echo ""
echo "Summary:"
echo "  ✓ Successful:   ${success_count}"
echo "  ✗ Failed:       ${failed_count}"
echo "  ⊘ Canceled:     ${canceled_count}"
echo "  ⟳ In Progress:  ${in_progress_count}"
echo ""

# Generate recommendations
echo "========================================"
echo "Recommendations"
echo "========================================"

if [ "$failed_count" -eq 0 ] && [ "$canceled_count" -eq 0 ]; then
  echo "✅ All deployments in the last 72 hours completed successfully!"
  echo "   No builds need to be rerun."
else
  echo "⚠️  Builds that should be reviewed and potentially rerun:"
  echo ""
  
  # Show failed deployments with details
  if [ "$failed_count" -gt 0 ]; then
    echo "Failed Deployments (${failed_count}):"
    echo "$deployments" | jq -c '.' | while IFS= read -r deployment; do
      status=$(analyze_deployment "$deployment")
      if [ "$status" = "failed" ]; then
        id=$(echo "$deployment" | jq -r '.id')
        created_at=$(echo "$deployment" | jq -r '.created_at')
        commit_hash=$(echo "$deployment" | jq -r '.commit_hash')
        commit_message=$(echo "$deployment" | jq -r '.commit_message' | head -c 60)
        environment=$(echo "$deployment" | jq -r '.environment')
        
        # Get failed stage info
        failed_stage=$(echo "$deployment" | jq -r '.stages[] | select(.status == "failure") | .name' | head -1)
        
        echo "  • Deployment ID: $id"
        echo "    Time: $created_at"
        echo "    Environment: $environment"
        echo "    Commit: $commit_hash"
        echo "    Message: $commit_message"
        echo "    Failed Stage: ${failed_stage:-unknown}"
        echo ""
      fi
    done
  fi
  
  # Show canceled deployments
  if [ "$canceled_count" -gt 0 ]; then
    echo "Canceled Deployments (${canceled_count}):"
    echo "$deployments" | jq -c '.' | while IFS= read -r deployment; do
      status=$(analyze_deployment "$deployment")
      if [ "$status" = "canceled" ]; then
        id=$(echo "$deployment" | jq -r '.id')
        created_at=$(echo "$deployment" | jq -r '.created_at')
        commit_hash=$(echo "$deployment" | jq -r '.commit_hash')
        commit_message=$(echo "$deployment" | jq -r '.commit_message' | head -c 60)
        environment=$(echo "$deployment" | jq -r '.environment')
        
        echo "  • Deployment ID: $id"
        echo "    Time: $created_at"
        echo "    Environment: $environment"
        echo "    Commit: $commit_hash"
        echo "    Message: $commit_message"
        echo ""
      fi
    done
  fi
  
  echo ""
  echo "How to rerun builds:"
  echo "  1. For specific commits, use the GitHub Actions workflow:"
  echo "     gh workflow run deploy.yml --ref main -f redeploy_count=1"
  echo ""
  echo "  2. To rollback/promote a specific deployment:"
  echo "     gh workflow run cloudflare-rollback.yml --ref main \\"
  echo "       -f target_sha=<COMMIT_HASH>"
  echo ""
  echo "  3. To manually trigger a deployment:"
  echo "     git commit --allow-empty -m 'Trigger deployment'"
  echo "     git push origin main"
fi

echo ""
echo "Review complete!"
