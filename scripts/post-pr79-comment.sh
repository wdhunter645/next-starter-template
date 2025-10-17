#!/usr/bin/env bash
# post-pr79-comment.sh
# Helper script to post Acceptance Checks and Cloudflare investigation to PR #79

set -euo pipefail

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

PR_NUMBER=79

# Comment body
read -r -d '' COMMENT << 'EOF' || true
## Acceptance Checks (A–G)

### A) Preconditions verified
- [ ] Local dev env clean (git status clean)
- [ ] Local .env configured (dummy/test keys only)

### B) Implementation steps executed
- [ ] Changeset is docs/scaffolding only
- [ ] Manual security audit of all new/changed .md files

### C) Repo health checks pass
- [ ] npm install
- [ ] npm run build
- [ ] npm run typecheck
- [ ] npm run lint

### D) Minimal e2e verification complete
- [ ] Visit "/" loads
- [ ] Magic-link sign-in works → /member/dashboard
- [ ] /admin/setup is protected (requires ADMIN_EMAILS)

### E) Artifacts updated
- [ ] README/CHANGELOG updated if needed

### F) Link PR(s) and reference parent
- [ ] Link parent tracking issue

### G) Post-implementation note
- [ ] Add short summary + rollback note

---

## Cloudflare Deployment Investigation

### Status
✅ **No actual deployment failure for PR #79**

### Finding
PR #79 is a docs-only PR (branch: `copilot/operationalize-after-action-reports`) and the Cloudflare deployment workflow (`.github/workflows/deploy.yml`) is configured to run **only on `main` branch pushes**. This is the correct behavior.

### Workflow Configuration
```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

### Analysis
The workflow that shows "failure" status for PR #79 commits is actually **expected behavior**:
- The deploy workflow only triggers on `main` branch
- PR #79's branch (`copilot/operationalize-after-action-reports`) is not `main`
- No deployment was attempted, and no deployment should be attempted for feature branches
- This is intentional to prevent preview deployments from consuming resources

### Recommendation
**No action required.** The Cloudflare deployment workflow is correctly configured. Docs-only PRs like #79 will show "no deployment" because they don't trigger the main deployment workflow until merged.

### Next Steps
Once PR #79 is merged to `main`, the deployment workflow will trigger automatically and deploy the changes to production.

---

## External Review Integration Updates

✅ **Completed in separate PR** (branch: `copilot/update-gitignore-and-acceptance-checks`):
- `.gitignore` hardening (added `/docs/archive/*.bak` and `/OPERATIONAL_BACKLOG.md.log`)
- `scripts/md_secret_audit.sh` - Automated secret scanning for markdown files
- `.github/workflows/docs-audit.yml` - CI workflow for docs audit
- `npm run audit:docs` script added to package.json

📋 **External Review Integration tracking issue** - To be created with parent issue script

---

_Posted as part of External Review Integration for PR #79 (Gemini)_
EOF

echo "Posting comment to PR #$PR_NUMBER..."
echo ""

gh pr comment "$PR_NUMBER" --body "$COMMENT"

if [ $? -eq 0 ]; then
    echo "✅ Successfully posted comment to PR #$PR_NUMBER"
    echo ""
    echo "View at: https://github.com/wdhunter645/next-starter-template/pull/$PR_NUMBER"
else
    echo "❌ Failed to post comment"
    exit 1
fi
