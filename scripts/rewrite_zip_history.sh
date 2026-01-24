#!/usr/bin/env bash
# rewrite_zip_history.sh — Git History Cleanup for ZIP Artifacts
#
# PURPOSE:
# Remove ZIP files from git history that were accidentally committed during
# repository recovery operations. This script rewrites git history to purge
# ZIP artifacts completely.
#
# CRITICAL SAFETY WARNING:
# This script performs DESTRUCTIVE operations that rewrite git history.
# - All contributors must re-clone the repository after this runs
# - Any open PRs will need to be rebased
# - Local branches will become incompatible
# - Force push is REQUIRED
#
# USAGE:
#   ./scripts/rewrite_zip_history.sh
#
# REQUIREMENTS:
# - git-filter-repo (install: pip install git-filter-repo)
# - Clean working directory (no uncommitted changes)
# - Backup recommended before running
#
# POST-EXECUTION:
# - Verify with: git log --all --full-history --source -- '*.zip'
# - Force push: git push origin --force --all
# - Notify all contributors to re-clone

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ZIP History Cleanup — Git Filter-Repo                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will REWRITE GIT HISTORY to remove ZIP files."
echo "⚠️  WARNING: This is a DESTRUCTIVE operation!"
echo ""
echo "Requirements:"
echo "  - Clean working directory"
echo "  - git-filter-repo installed"
echo "  - Repository backup recommended"
echo ""
echo "After running:"
echo "  - Force push required: git push origin --force --all"
echo "  - All contributors must re-clone"
echo "  - All open PRs must be rebased"
echo ""
read -p "Are you sure you want to continue? (yes/NO): " confirm

if [[ "${confirm}" != "yes" ]]; then
  echo "❌ Aborted. No changes made."
  exit 1
fi

# Verify working directory is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Error: Working directory is not clean."
  echo "   Commit or stash changes before running this script."
  exit 1
fi

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
  echo "❌ Error: git-filter-repo is not installed."
  echo "   Install with: pip install git-filter-repo"
  echo "   Or visit: https://github.com/newren/git-filter-repo"
  exit 1
fi

# Backup current branch
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "📋 Current branch: $CURRENT_BRANCH"

# Search for ZIP files in history
echo ""
echo "🔍 Searching for ZIP files in git history..."
ZIP_FILES=$(git log --all --full-history --source --pretty=format: --name-only -- '*.zip' '*.ZIP' | sort -u || true)

if [[ -z "$ZIP_FILES" ]]; then
  echo "✅ No ZIP files found in git history."
  echo "   Nothing to clean up."
  exit 0
fi

echo "Found ZIP files in history:"
echo "$ZIP_FILES" | sed 's/^/  - /'
echo ""

# Create backup tag
BACKUP_TAG="backup-before-zip-cleanup-$(date +%Y%m%d-%H%M%S)"
echo "📌 Creating backup tag: $BACKUP_TAG"
git tag "$BACKUP_TAG"

# Run git-filter-repo to remove ZIP files
echo ""
echo "🗑️  Removing ZIP files from git history..."
git-filter-repo --force --invert-paths \
  --path-glob '*.zip' \
  --path-glob '*.ZIP'

echo ""
echo "✅ ZIP files removed from git history."
echo ""
echo "📊 Repository stats:"
git count-objects -vH

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  NEXT STEPS (REQUIRED)                                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Verify cleanup:"
echo "   git log --all --full-history --source -- '*.zip'"
echo "   (Should return no results)"
echo ""
echo "2. Force push to remote:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Notify all contributors:"
echo "   - Delete local clones"
echo "   - Re-clone from origin"
echo "   - Rebase any open PRs"
echo ""
echo "4. Backup tag created: $BACKUP_TAG"
echo "   To restore if needed:"
echo "   git reset --hard $BACKUP_TAG"
echo ""
echo "⚠️  Do NOT forget to force push!"
echo ""
