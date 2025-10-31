#!/usr/bin/env bash
# codex_probe_pr.sh — sanity-check PR path (verifies perms even if Codex is flaky)
set -euo pipefail

# Requirements: gh CLI authenticated; repo has a default branch
if ! command -v gh >/dev/null 2>&1; then
  echo "gh (GitHub CLI) not found. Install & auth: https://cli.github.com/"; exit 1
fi
gh auth status >/dev/null || { echo "gh not authenticated"; exit 1; }

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

BASE_BRANCH="$(git rev-parse --abbrev-ref origin/HEAD 2>/dev/null | cut -d/ -f2 || echo main)"
TS="$(date +%Y%m%d-%H%M%S)"
BR="probe/codex-pr-$TS"

git fetch origin "$BASE_BRANCH" >/dev/null 2>&1 || true
git checkout -B "$BR" "origin/$BASE_BRANCH" 2>/dev/null || git checkout -B "$BR" "$BASE_BRANCH"

# Create a tiny, harmless change
mkdir -p probes
echo "- $(date -Is) — PR path verified" >> probes/PR_PATH_CHECKLIST.md

git add probes/PR_PATH_CHECKLIST.md
git commit -m "chore(probe): verify PR path via gh on $TS" >/dev/null
git push -u origin "$BR"

TITLE="Probe: verify PR creation/path via gh ($TS)"
BODY=$'Automated probe to confirm PR permissions/path are healthy.\n\nIf Codex cannot open PRs, this verifies the repo can.\n\n- Created by scripts/codex_probe_pr.sh'

# Open PR (idempotent-ish: if PR exists, just print link)
set +e
PR_URL="$(gh pr view "$BR" --json url -q .url 2>/dev/null)"
set -e
if [[ -z "${PR_URL:-}" || "${PR_URL}" == "null" ]]; then
  gh pr create --base "$BASE_BRANCH" --head "$BR" --title "$TITLE" --body "$BODY"
else
  echo "PR already exists: $PR_URL"
fi
