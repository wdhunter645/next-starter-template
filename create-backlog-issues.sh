#!/usr/bin/env bash
#
# create-backlog-issues.sh
#
# Creates GitHub issues from the backlog specifications
# Requires: gh CLI authenticated
#

set -e

REPO="wdhunter645/next-starter-template"
DOCS_DIR="docs/backlog"

echo "🚀 Creating Operational Backlog Issues"
echo "Repository: $REPO"
echo

# Check if gh CLI is available and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ Error: gh CLI not found"
    echo "Install from: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ Error: gh CLI not authenticated"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ gh CLI authenticated"
echo

# Create parent issue
echo "📋 Creating parent issue..."
PARENT_BODY=$(cat "$DOCS_DIR/PARENT_ISSUE.md")
PARENT_ISSUE=$(gh issue create \
    --repo "$REPO" \
    --title "Operational Backlog from After-Action Reports" \
    --body "$PARENT_BODY" \
    --label "ops,backlog,automation" \
    2>&1)

PARENT_NUMBER=$(echo "$PARENT_ISSUE" | grep -oE '[0-9]+$' | head -1)
echo "✅ Created parent issue #$PARENT_NUMBER"
echo

# Array of sub-issues
declare -a ISSUES=(
    "01:Consolidate duplicate authentication documentation into clear hierarchy:docs,cleanup,ops"
    "02:Archive after-action reports to declutter root directory:cleanup,ops,documentation"
    "03:Complete security remediation by rotating exposed secrets:security,critical,ops"
    "04:Add automated tests for OAuth callback handler:testing,enhancement,oauth"
    "05:Automate deployment verification checklist:ci-cd,automation,testing"
    "06:Add security event logging and OAuth metrics:observability,security,enhancement"
    "07:Design and document OAuth token refresh mechanism:documentation,enhancement,oauth"
    "08:Create unified onboarding guide for new developers:documentation,onboarding,ops"
)

# Create sub-issues
for issue_spec in "${ISSUES[@]}"; do
    IFS=':' read -r num title labels <<< "$issue_spec"
    
    file="$DOCS_DIR/SUB_ISSUE_${num}_*.md"
    file=$(ls $file 2>/dev/null | head -1)
    
    if [ ! -f "$file" ]; then
        echo "⚠️  Warning: File not found for issue $num"
        continue
    fi
    
    echo "📋 Creating sub-issue $num: $title"
    
    # Read file and replace placeholder
    body=$(cat "$file" | sed "s/#\[PARENT_ISSUE_NUMBER\]/#$PARENT_NUMBER/g")
    
    # Create issue
    issue_url=$(gh issue create \
        --repo "$REPO" \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        2>&1)
    
    issue_number=$(echo "$issue_url" | grep -oE '[0-9]+$' | head -1)
    echo "✅ Created sub-issue #$issue_number"
    echo
done

echo
echo "🎉 All issues created successfully!"
echo
echo "Next steps:"
echo "1. Update PR #79 description with issue checklist"
echo "2. Link PR #79 to parent issue #$PARENT_NUMBER"
echo "3. Post status comment on parent issue"
echo
echo "Parent issue: https://github.com/$REPO/issues/$PARENT_NUMBER"
