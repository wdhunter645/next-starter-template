#!/usr/bin/env bash
# create-external-review-parent-issue.sh
# Helper script to create the parent tracking issue for external review integration

set -euo pipefail

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Issue title
TITLE="External Review Integration for PR #79 (Gemini)"

# Issue body
read -r -d '' BODY << 'EOF' || true
## Overview
Integration of external review feedback from Google/Gemini for PR #79.

## What I Found

Based on the "Final Report: Next.js Starter Template PR Review #79" from Google/Gemini:

1. **Documentation Artifacts Need Gitignore Hardening**
   - Archive backup files (*.bak) in `/docs/archive/` should be ignored
   - Operational log files like `/OPERATIONAL_BACKLOG.md.log` should be ignored

2. **Docs Need Automated Secret Scanning**
   - Markdown files should be scanned for accidental secret exposure
   - Patterns: API keys, tokens, passwords, Supabase keys, JWT tokens, etc.

3. **PR #79 Needs Structured Acceptance Criteria**
   - Missing the standardized A→G acceptance loop
   - Should include preconditions, implementation steps, health checks, etc.

4. **Cloudflare Build Failure Needs Investigation**
   - Investigate if docs-only PRs should trigger builds
   - Status: INVESTIGATED - No actual failure; workflow correctly only runs on main branch

## Backlog

- [x] 1. Merge .gitignore hardening (#79)
- [x] 2. Run docs secret-audit (script + CI) and fix any findings (#79)
- [ ] 3. Make build green (npm install/build/typecheck/lint)
- [x] 4. Diagnose Cloudflare failure; attach log snippet + fix plan (No failure found)
- [ ] 5. Add rollback note into PR footer

## Implementation Status

### Completed in Branch: copilot/update-gitignore-and-acceptance-checks
- ✅ `.gitignore` updated with documentation artifact patterns
- ✅ `scripts/md_secret_audit.sh` created (secret scanning for markdown)
- ✅ `.github/workflows/docs-audit.yml` created (CI automation)
- ✅ `package.json` updated with `audit:docs` npm script
- ✅ Cloudflare deployment investigation completed
- ✅ `EXTERNAL_REVIEW_INTEGRATION_PR79.md` documentation created

### Pending Manual Actions
1. Add Acceptance Checks (A–G) to PR #79 description
2. Link PR #79 to this parent issue
3. Run health checks (npm install/build/lint)
4. Add rollback note to PR #79

## Links
- PR #79: https://github.com/wdhunter645/next-starter-template/pull/79
- Review Branch: copilot/update-gitignore-and-acceptance-checks
- Documentation: `EXTERNAL_REVIEW_INTEGRATION_PR79.md`

## Next Steps
1. Review and merge PR changes for gitignore + docs audit tooling
2. Complete pending manual actions listed above
3. Verify all health checks pass
4. Close this issue once all backlog items are complete

---
_This issue tracks integration of external review feedback into the operational backlog._
EOF

echo "Creating parent issue: $TITLE"
echo ""

# Create the issue with labels
ISSUE_URL=$(gh issue create \
    --title "$TITLE" \
    --body "$BODY" \
    --label "ops,backlog,automation,security" \
    2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Successfully created issue!"
    echo ""
    echo "$ISSUE_URL"
    echo ""
    echo "Next steps:"
    echo "1. Copy the issue number from the URL above"
    echo "2. Add a comment to PR #79 referencing this issue"
    echo "3. Update PR #79 description with Acceptance Checks (see EXTERNAL_REVIEW_INTEGRATION_PR79.md)"
else
    echo "❌ Failed to create issue"
    echo "$ISSUE_URL"
    exit 1
fi
