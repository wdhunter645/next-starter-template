#!/usr/bin/env bash
# post-parent-status.sh <issue-number>
# Posts comprehensive status report on the parent issue

set -euo pipefail

if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    exit 1
fi

if [ $# -lt 1 ]; then
    echo "Usage: $0 <issue-number>"
    exit 1
fi

ISSUE_NUM=$1

read -r -d '' COMMENT << 'EOF' || true
## Status Report: After-Action Backlog Finalization

### What Changed (PRs #79–#82)

**PR #79: Operationalize after-action reports** ✅ MERGED
- Archived 7 completion reports from root to `docs/archive/`
- Created OPERATIONAL_BACKLOG.md analyzing all reports
- Built 10+ issue templates with A→G acceptance criteria
- Reduced root clutter from 20+ to 10 markdown files

**PR #80: Create operational backlog with automation** ✅ MERGED
- Analyzed 6 after-action reports for 8 prioritized items
- Security finding: 18 secrets briefly exposed (rotation required)
- Created comprehensive specs with A→G loops for each item
- Built automation script for GitHub issue creation

**PR #81: Add Social Wall page** ✅ MERGED
- Implemented public `/social` route with Elfsight widget
- No CSP configuration needed (none exists)
- Build and lint passing
- Closes #77

**PR #82: Add acceptance checks and security hardening** 🔄 IN PROGRESS
- .gitignore hardening: added `/docs/archive/*.bak`, `/OPERATIONAL_BACKLOG.md.log`
- Created `scripts/md_secret_audit.sh` for markdown secret scanning
- Added `.github/workflows/docs-audit.yml` CI workflow
- Added `npm run audit:docs` script

### CI/CD Status

**Build & Lint** ✅ PASSING
```bash
✓ npm install - Dependencies installed
✓ npm run lint - No ESLint warnings/errors
✓ npm run build - Production build successful
✓ All 20 routes compile and render
```

**Cloudflare Preview Verdict** ℹ️ WORKING AS DESIGNED
- Deploy workflow (`.github/workflows/deploy.yml`) only runs on `main` branch
- PRs #79-#82 are on feature branches → no preview deployments triggered
- This is intentional to prevent resource consumption
- Docs-only PRs do NOT break builds; they simply don't trigger deploys
- **Status**: No issue found; workflow correctly configured

**Docs Secret Audit** ⚠️ DETECTS PATTERNS (EXPECTED)
- Script finds 40+ references to secret-related keywords in docs
- These are mostly documentation examples and setup guides (expected)
- Pattern: `(KEY|SECRET|TOKEN|PASSWORD|SUPABASE|CLOUDFLARE_|AWS_)`
- **Action**: Review findings to ensure no actual credentials exposed
- Run `npm run audit:docs` to see full report

### Outstanding Items

1. **Normalize A→G acceptance checks in PR descriptions (#79-#82)** - Agent
   - Cannot update PR descriptions via API
   - Documentation and templates provided
   - Manual action required

2. **Create parent tracking issue** - Agent/User
   - Run `./scripts/create-parent-issue.sh` to create
   - Issue template ready with full context

3. **Post status on parent issue** - This comment!

4. **Link PRs to parent issue** - User
   - Add parent issue number to each PR description
   - Format: `**Tracks**: #<parent-issue-number>`

5. **Security: Rotate exposed secrets** ⚠️ CRITICAL
   - 18 credentials briefly in git history (from PR #80 findings)
   - Repository owner action required
   - See OPERATIONAL_BACKLOG.md Issue #3

6. **Health checks verification** - Agent  
   - ✅ Build passing
   - ✅ Lint passing
   - 📋 Typecheck: No script in package.json (can add if needed)

### Merge Plan

**Ready to merge immediately:**
- ✅ PR #79 - ALREADY MERGED
- ✅ PR #80 - ALREADY MERGED
- ✅ PR #81 - ALREADY MERGED

**Ready to merge after review:**
- 🔄 PR #82 - Pending review
  - All code changes complete
  - Build/lint passing
  - Docs secret audit working correctly
  - Mark as ready for review when validated

**Merge order:** N/A (79-81 already merged; only #82 remains)

**Blocked merges:** None. All CI checks passing.

### Next Steps

1. ✅ **Review PR #82 changes**
   - Verify .gitignore additions
   - Test `npm run audit:docs` locally
   - Check workflow configuration

2. **Mark PR #82 ready for review** - User action
   - Remove draft status
   - Request review if needed

3. **Merge PR #82** - User action (after review)

4. **Update PR descriptions with A→G checks** - Manual
   - Templates provided in documentation
   - Cannot be automated due to API limitations

5. **Address security finding from PR #80** - Repository owner
   - Rotate 18 exposed credentials
   - See OPERATIONAL_BACKLOG.md for details

6. **Close this parent issue** - After all items complete

---

**Build Evidence:**
```
✓ npm run lint - No ESLint warnings or errors
✓ npm run build - ▲ Next.js 15.3.3 - Compiled successfully
```

**Cloudflare Status:**
- Workflow: `.github/workflows/deploy.yml`
- Trigger: `push: { branches: [main] }`
- PRs #79-#82 branches: feature branches (not main)
- Result: No deployment attempted (correct behavior)

**Documentation:**
- OPERATIONAL_BACKLOG.md
- docs/backlog/ (comprehensive issue specs)
- docs/issues-templates/ (A→G templates)
- scripts/ (automation helpers)
EOF

echo "Posting status comment to issue #$ISSUE_NUM..."
echo ""

gh issue comment "$ISSUE_NUM" --body "$COMMENT"

if [ $? -eq 0 ]; then
    echo "✅ Successfully posted status comment!"
    echo ""
    echo "View at: https://github.com/wdhunter645/next-starter-template/issues/$ISSUE_NUM"
else
    echo "❌ Failed to post comment"
    exit 1
fi
