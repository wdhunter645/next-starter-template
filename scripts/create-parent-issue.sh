#!/usr/bin/env bash
# create-parent-issue.sh
# Creates the parent tracking issue "Operational Backlog from After-Action Reports"

set -euo pipefail

if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install from: https://cli.github.com/"
    exit 1
fi

TITLE="Operational Backlog from After-Action Reports"

read -r -d '' BODY << 'EOF' || true
## Overview

This parent issue tracks the completion and finalization of after-action backlog work from PRs #79–#82.

## Sub-Issues/PRs Status

### Completed and Merged
- ✅ **PR #79** - Operationalize after-action reports and scaffold operational backlog
  - Status: MERGED (2025-10-17)
  - Archived 7 completion reports
  - Created OPERATIONAL_BACKLOG.md with 10 prioritized items
  - Built issue templates with A→G acceptance criteria
  
- ✅ **PR #80** - Create operational backlog from after-action reports with automated issue creation  
  - Status: MERGED (2025-10-17)
  - Analysis of 6 after-action reports
  - 8 prioritized backlog items with comprehensive specs
  - Automation scripts for issue creation
  
- ✅ **PR #81** - Add Social Wall (/social) using Elfsight
  - Status: MERGED (2025-10-17)
  - Implemented public /social page
  - Embedded Elfsight Social Feed widget
  - Closes #77

### Open/In Progress
- 🔄 **PR #82** - Update .gitignore and add acceptance checks
  - Status: OPEN (draft)
  - .gitignore hardening (docs artifacts)
  - Docs secret audit script + CI workflow
  - Acceptance checks documentation

## Key Tasks

- [x] 1. Archive after-action reports
- [x] 2. Create operational backlog documentation
- [x] 3. Build issue templates with A→G acceptance criteria
- [x] 4. Implement /social page (#77)
- [x] 5. Add .gitignore hardening for docs artifacts
- [x] 6. Create docs secret audit automation
- [ ] 7. Normalize A→G acceptance checks across all PRs (#79-#82)
- [ ] 8. Verify CI/CD health (build/lint/typecheck pass)
- [ ] 9. Document Cloudflare build behavior for docs-only PRs
- [ ] 10. Create comprehensive status report

## Labels

- ops
- backlog
- automation  
- security

## Links

- PR #79: https://github.com/wdhunter645/next-starter-template/pull/79
- PR #80: https://github.com/wdhunter645/next-starter-template/pull/80
- PR #81: https://github.com/wdhunter645/next-starter-template/pull/81
- PR #82: https://github.com/wdhunter645/next-starter-template/pull/82
EOF

echo "Creating parent issue: $TITLE"
echo ""

ISSUE_URL=$(gh issue create \
    --title "$TITLE" \
    --body "$BODY" \
    --label "ops,backlog,automation,security" \
    2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Successfully created parent issue!"
    echo ""
    echo "$ISSUE_URL"
    echo ""
    echo "Next: Add status comment using ./scripts/post-parent-status.sh <issue-number>"
else
    echo "❌ Failed to create issue"
    echo "$ISSUE_URL"
    exit 1
fi
