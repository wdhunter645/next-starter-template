# Issue Creation Guide

This guide helps create GitHub issues from the templates in this directory.

## Quick Start

### Option 1: Using GitHub CLI (Requires GH_TOKEN)

```bash
# Set token (if not already set)
export GH_TOKEN="your_github_token_here"

# Create parent issue
gh issue create \
  --title "Operational Backlog from After-Action Reports" \
  --body-file docs/issues-templates/PARENT_ISSUE.md \
  --label "ops,backlog,automation" \
  --repo wdhunter645/next-starter-template

# Get the issue number (e.g., #45)
PARENT_ISSUE=45

# Create sub-issues (update #{PARENT_ISSUE_NUMBER} with actual number first)
# Issue 1
gh issue create \
  --title "Consolidate Documentation Architecture" \
  --body-file docs/issues-templates/ISSUE_01_CONSOLIDATE_DOCS.md \
  --label "docs,cleanup,high-priority" \
  --repo wdhunter645/next-starter-template

# Issue 2
gh issue create \
  --title "Archive After-Action Reports" \
  --body-file docs/issues-templates/ISSUE_02_ARCHIVE_REPORTS.md \
  --label "cleanup,docs,high-priority" \
  --repo wdhunter645/next-starter-template

# Issue 3
gh issue create \
  --title "Verify Security Incident Remediation" \
  --body-file docs/issues-templates/ISSUE_03_SECURITY_AUDIT.md \
  --label "security,audit,high-priority" \
  --repo wdhunter645/next-starter-template

# Continue for issues 4-10...
```

### Option 2: Manual Creation via GitHub UI

1. Go to: https://github.com/wdhunter645/next-starter-template/issues/new
2. Copy content from each template file
3. Replace `#{PARENT_ISSUE_NUMBER}` with actual parent issue number
4. Add appropriate labels
5. Submit issue

## Issue Creation Order

1. **Parent Issue First** - Create tracking issue from PARENT_ISSUE.md
2. **Note the issue number** (e.g., #45)
3. **Update templates** - Replace `#{PARENT_ISSUE_NUMBER}` in all sub-issue templates
4. **Create sub-issues** in order:
   - Issue 1: Consolidate Documentation
   - Issue 2: Archive After-Action Reports (GOOD FIRST ISSUE)
   - Issue 3: Security Audit (requires owner)
   - Issues 4-10: As needed based on priority

## Automated Script (Bash)

```bash
#!/bin/bash
# create-issues.sh - Automated issue creation

set -e

REPO="wdhunter645/next-starter-template"
TEMPLATES_DIR="docs/issues-templates"

# Check for gh CLI
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI not found. Install from https://cli.github.com"
    exit 1
fi

# Verify authentication
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated. Run: gh auth login"
    exit 1
fi

echo "Creating parent tracking issue..."
PARENT_URL=$(gh issue create \
    --repo "$REPO" \
    --title "Operational Backlog from After-Action Reports" \
    --body-file "$TEMPLATES_DIR/PARENT_ISSUE.md" \
    --label "ops,backlog,automation")

PARENT_NUMBER=$(echo "$PARENT_URL" | grep -oP '\d+$')
echo "✓ Parent issue created: #$PARENT_NUMBER"
echo

# Update parent issue reference in templates
echo "Updating templates with parent issue number..."
for template in "$TEMPLATES_DIR"/ISSUE_*.md; do
    sed -i "s/#{PARENT_ISSUE_NUMBER}/#$PARENT_NUMBER/g" "$template"
done
echo "✓ Templates updated"
echo

# Create Issue 1
echo "Creating Issue 1: Consolidate Documentation..."
gh issue create \
    --repo "$REPO" \
    --title "Consolidate Documentation Architecture" \
    --body-file "$TEMPLATES_DIR/ISSUE_01_CONSOLIDATE_DOCS.md" \
    --label "docs,cleanup,high-priority"

# Create Issue 2
echo "Creating Issue 2: Archive After-Action Reports..."
gh issue create \
    --repo "$REPO" \
    --title "Archive After-Action Reports" \
    --body-file "$TEMPLATES_DIR/ISSUE_02_ARCHIVE_REPORTS.md" \
    --label "cleanup,docs,high-priority,good-first-issue"

# Create Issue 3
echo "Creating Issue 3: Verify Security Incident..."
gh issue create \
    --repo "$REPO" \
    --title "Verify Security Incident Remediation" \
    --body-file "$TEMPLATES_DIR/ISSUE_03_SECURITY_AUDIT.md" \
    --label "security,audit,high-priority"

# Create Issue 4
echo "Creating Issue 4: Test Infrastructure..."
gh issue create \
    --repo "$REPO" \
    --title "Create Automated Test Infrastructure" \
    --body-file "$TEMPLATES_DIR/ISSUE_04_TEST_INFRASTRUCTURE.md" \
    --label "testing,ci-cd,infrastructure"

# Create Issue 5
echo "Creating Issue 5: Deployment Verification..."
gh issue create \
    --repo "$REPO" \
    --title "Automate Production Deployment Verification" \
    --body-file "$TEMPLATES_DIR/ISSUE_05_DEPLOYMENT_VERIFICATION.md" \
    --label "automation,deployment,ci-cd"

echo
echo "✓ All issues created successfully!"
echo "Next steps:"
echo "1. Review issues at: https://github.com/$REPO/issues"
echo "2. Create draft PRs for issues 2 and 7"
echo "3. Add status comment to parent issue #$PARENT_NUMBER"
```

## Labels to Create (if needed)

Create these labels in GitHub if they don't exist:

| Label | Color | Description |
|-------|-------|-------------|
| ops | #0E8A16 | Operational tasks |
| backlog | #D93F0B | Backlog items |
| automation | #1D76DB | Automation improvements |
| cleanup | #FEF2C0 | Code/doc cleanup |
| high-priority | #D93F0B | High priority items |
| security | #D93F0B | Security related |
| audit | #FBB040 | Audit tasks |
| runbook | #0075CA | Runbook documentation |
| good-first-issue | #7057FF | Good for newcomers |

## Post-Creation Checklist

After creating all issues:

- [ ] Verify parent issue created successfully
- [ ] Verify all sub-issues reference parent
- [ ] Update parent issue with actual sub-issue numbers
- [ ] Create draft PRs for issues 2 and 7 (see next section)
- [ ] Add status comment to parent issue

## Files in This Directory

- `PARENT_ISSUE.md` - Parent tracking issue template
- `ISSUE_01_CONSOLIDATE_DOCS.md` - Documentation consolidation (6.7KB)
- `ISSUE_02_ARCHIVE_REPORTS.md` - Archive completion reports (7.3KB)
- `ISSUE_03_SECURITY_AUDIT.md` - Security audit (8.6KB)
- `ISSUE_04_TEST_INFRASTRUCTURE.md` - Test framework (1.9KB)
- `ISSUE_05_DEPLOYMENT_VERIFICATION.md` - Deployment checks (0.6KB)
- `ISSUE_06_TO_10.md` - Remaining issues summary (1.5KB)
- `README.md` - This file

## Troubleshooting

### "gh: command not found"
Install GitHub CLI: https://cli.github.com

### "authentication required"
Run: `gh auth login`

### "permission denied"
Ensure your GitHub token has `repo` scope

### Templates not found
Ensure you're running from repository root

## Next: Creating Draft PRs

See `../draft-prs/README.md` for creating draft PRs for issues 2 and 7.
