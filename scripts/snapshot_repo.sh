#!/usr/bin/env bash
# snapshot_repo.sh - Create a deterministic repository snapshot
# Produces both JSON (machine-parseable) and human-readable outputs
# Safe to run multiple times (idempotent)

set -euo pipefail

# Constants
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SNAPSHOT_DIR="${REPO_ROOT}/snapshots"
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
JSON_FILE="${SNAPSHOT_DIR}/repo-snapshot-${TIMESTAMP}.json"
SMOKETEST_FILE="${SNAPSHOT_DIR}/_smoketest.txt"

# Ensure snapshot directory exists
mkdir -p "${SNAPSHOT_DIR}"

# Collect repository metadata
cd "${REPO_ROOT}"

COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
AUTHOR=$(git log -1 --format='%an <%ae>' 2>/dev/null || echo "unknown")
COMMIT_DATE=$(git log -1 --format='%ai' 2>/dev/null || echo "unknown")
COMMIT_MESSAGE=$(git log -1 --format='%s' 2>/dev/null || echo "unknown")

# Get changed files from last commit
CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null | jq -R -s -c 'split("\n") | map(select(length > 0))' || echo '[]')

# Get top-level tree
TOP_LEVEL_TREE=$(find . -maxdepth 1 -not -path '.' -not -path './.git' -printf '%P\n' | sort | jq -R -s -c 'split("\n") | map(select(length > 0))' || echo '[]')

# Extract package.json info if it exists
PKG_NAME="null"
PKG_VERSION="null"
if [[ -f "package.json" ]]; then
  PKG_NAME=$(jq -r '.name // "null"' package.json)
  PKG_VERSION=$(jq -r '.version // "null"' package.json)
fi

# Build JSON snapshot
cat > "${JSON_FILE}" <<EOF
{
  "snapshot_timestamp": "${TIMESTAMP}",
  "repository": {
    "commit_sha": "${COMMIT_SHA}",
    "branch": "${BRANCH}",
    "author": "${AUTHOR}",
    "commit_date": "${COMMIT_DATE}",
    "commit_message": "${COMMIT_MESSAGE}"
  },
  "changed_files": ${CHANGED_FILES},
  "top_level_tree": ${TOP_LEVEL_TREE},
  "package": {
    "name": "${PKG_NAME}",
    "version": "${PKG_VERSION}"
  }
}
EOF

# Update smoketest file
echo "snapshot-pipeline-ok ${TIMESTAMP}" >> "${SMOKETEST_FILE}"

echo "✅ Snapshot created: ${JSON_FILE}"
echo "✅ Smoketest updated: ${SMOKETEST_FILE}"
