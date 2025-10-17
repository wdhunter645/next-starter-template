#!/usr/bin/env bash
# md_secret_audit.sh - Scans staged/changed *.md files for secrets and sensitive patterns
# Exit non-zero if any potential secrets are found

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Pattern to match potential secrets and sensitive information
PATTERNS='(KEY|SECRET|TOKEN|PASSWORD|APP_KEY|ANON_KEY|SERVICE_ROLE|B2_|SUPABASE|VERCEL_|CLOUDFLARE_|AWS_)|(https?://[^\s]*token[^\s]*)|(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})'

# Get changed/staged .md files
if git rev-parse --git-dir > /dev/null 2>&1; then
    # In a git repo - check staged or changed files
    CHANGED_FILES=$(git diff --name-only --cached --diff-filter=ACM "*.md" 2>/dev/null || true)
    if [ -z "$CHANGED_FILES" ]; then
        # No staged files, check working tree changes
        CHANGED_FILES=$(git diff --name-only --diff-filter=ACM "*.md" 2>/dev/null || true)
    fi
    if [ -z "$CHANGED_FILES" ]; then
        # No changes, check all tracked md files
        CHANGED_FILES=$(git ls-files "*.md" 2>/dev/null || true)
    fi
else
    # Not in a git repo - scan all .md files
    CHANGED_FILES=$(find . -name "*.md" -type f 2>/dev/null || true)
fi

if [ -z "$CHANGED_FILES" ]; then
    echo -e "${GREEN}✓ No markdown files to audit${NC}"
    exit 0
fi

echo "Auditing markdown files for secrets and sensitive patterns..."
echo "Files to check:"
echo "$CHANGED_FILES" | sed 's/^/  /'
echo ""

# Scan files for secrets
FINDINGS=""
FOUND_COUNT=0

while IFS= read -r file; do
    if [ -f "$file" ]; then
        # Use grep to find matches with line numbers
        MATCHES=$(grep -nEH "$PATTERNS" "$file" 2>/dev/null || true)
        if [ -n "$MATCHES" ]; then
            FINDINGS="${FINDINGS}\n${YELLOW}File: ${file}${NC}\n${MATCHES}\n"
            FOUND_COUNT=$((FOUND_COUNT + 1))
        fi
    fi
done <<< "$CHANGED_FILES"

if [ $FOUND_COUNT -gt 0 ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ SECRET AUDIT FAILED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Found ${RED}${FOUND_COUNT}${NC} file(s) with potential secrets or sensitive patterns:"
    echo ""
    echo -e "$FINDINGS"
    echo ""
    echo -e "${YELLOW}Action required:${NC}"
    echo "  1. Review the matched lines above"
    echo "  2. Remove or redact any actual secrets/credentials"
    echo "  3. Use placeholders like <YOUR_KEY_HERE> or *** for examples"
    echo "  4. Re-run this audit after making changes"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ No potential secrets found in markdown files${NC}"
    exit 0
fi
