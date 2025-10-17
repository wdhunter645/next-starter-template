#!/bin/bash
# create-backlog-issues.sh - Automated issue creation from templates
# Usage: ./create-backlog-issues.sh

set -e

REPO="wdhunter645/next-starter-template"
TEMPLATES_DIR="docs/issues-templates"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Operational Backlog Issue Creator"
echo "=========================================="
echo

# Check for gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI not found.${NC}"
    echo "Install from: https://cli.github.com"
    echo
    echo "Alternative: Create issues manually via GitHub UI"
    echo "Templates available in: $TEMPLATES_DIR/"
    exit 1
fi

# Verify authentication
echo "Checking GitHub authentication..."
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI.${NC}"
    echo "Run: gh auth login"
    exit 1
fi
echo -e "${GREEN}✓ Authenticated${NC}"
echo

# Confirm repository
echo "Target repository: $REPO"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi
echo

# Create parent tracking issue
echo "Creating parent tracking issue..."
PARENT_URL=$(gh issue create \
    --repo "$REPO" \
    --title "Operational Backlog from After-Action Reports" \
    --body-file "$TEMPLATES_DIR/PARENT_ISSUE.md" \
    --label "ops,backlog,automation")

PARENT_NUMBER=$(echo "$PARENT_URL" | grep -oP '\d+$')
echo -e "${GREEN}✓ Parent issue created: #$PARENT_NUMBER${NC}"
echo "  URL: $PARENT_URL"
echo

# Update templates with parent issue number
echo "Updating sub-issue templates with parent issue number..."
for template in "$TEMPLATES_DIR"/ISSUE_*.md; do
    # Skip if file doesn't exist or is the summary file
    if [ ! -f "$template" ] || [[ "$template" == *"ISSUE_06_TO_10"* ]]; then
        continue
    fi
    sed -i "s/#{PARENT_ISSUE_NUMBER}/#$PARENT_NUMBER/g" "$template"
done
echo -e "${GREEN}✓ Templates updated${NC}"
echo

# Ask which issues to create
echo "Which sub-issues would you like to create?"
echo "1. All issues (1-10)"
echo "2. High priority only (1-3)"
echo "3. Custom selection"
read -p "Choice (1-3): " CHOICE

case $CHOICE in
    1)
        ISSUES=(1 2 3 4 5)
        echo "Creating all issues..."
        ;;
    2)
        ISSUES=(1 2 3)
        echo "Creating high priority issues..."
        ;;
    3)
        read -p "Enter issue numbers to create (space-separated, e.g., 1 3 5): " -a ISSUES
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
echo

# Issue metadata
declare -A TITLES
TITLES[1]="Consolidate Documentation Architecture"
TITLES[2]="Archive After-Action Reports"
TITLES[3]="Verify Security Incident Remediation"
TITLES[4]="Create Automated Test Infrastructure"
TITLES[5]="Automate Production Deployment Verification"

declare -A LABELS
LABELS[1]="docs,cleanup,high-priority"
LABELS[2]="cleanup,docs,high-priority,good-first-issue"
LABELS[3]="security,audit,high-priority"
LABELS[4]="testing,ci-cd,infrastructure"
LABELS[5]="automation,deployment,ci-cd"

declare -A TEMPLATES
TEMPLATES[1]="ISSUE_01_CONSOLIDATE_DOCS.md"
TEMPLATES[2]="ISSUE_02_ARCHIVE_REPORTS.md"
TEMPLATES[3]="ISSUE_03_SECURITY_AUDIT.md"
TEMPLATES[4]="ISSUE_04_TEST_INFRASTRUCTURE.md"
TEMPLATES[5]="ISSUE_05_DEPLOYMENT_VERIFICATION.md"

# Create selected issues
CREATED=0
for ISSUE_NUM in "${ISSUES[@]}"; do
    if [ -f "$TEMPLATES_DIR/${TEMPLATES[$ISSUE_NUM]}" ]; then
        echo "Creating Issue $ISSUE_NUM: ${TITLES[$ISSUE_NUM]}..."
        
        ISSUE_URL=$(gh issue create \
            --repo "$REPO" \
            --title "${TITLES[$ISSUE_NUM]}" \
            --body-file "$TEMPLATES_DIR/${TEMPLATES[$ISSUE_NUM]}" \
            --label "${LABELS[$ISSUE_NUM]}")
        
        ISSUE_NUMBER=$(echo "$ISSUE_URL" | grep -oP '\d+$')
        echo -e "${GREEN}✓ Issue #$ISSUE_NUMBER created${NC}"
        echo "  URL: $ISSUE_URL"
        ((CREATED++))
    else
        echo -e "${YELLOW}⚠ Template not found: ${TEMPLATES[$ISSUE_NUM]}${NC}"
    fi
    echo
done

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo -e "${GREEN}✓ Parent issue: #$PARENT_NUMBER${NC}"
echo -e "${GREEN}✓ Sub-issues created: $CREATED${NC}"
echo
echo "Next steps:"
echo "1. Review issues at: https://github.com/$REPO/issues"
echo "2. Post status report to parent issue #$PARENT_NUMBER"
echo "   (Template: docs/issues-templates/STATUS_REPORT.md)"
echo "3. Begin execution with high-priority issues"
echo
echo "Note: Issue #2 (Archive Reports) is already complete in this PR!"
echo "=========================================="
