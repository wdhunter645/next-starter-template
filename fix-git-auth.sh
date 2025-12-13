#!/bin/bash

# Git Authentication Reset Script for Codespaces
# This script clears all cached credentials and helps you re-authenticate
# Usage: ./fix-git-auth.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Git Authentication Reset for Codespaces"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Clear everything
echo "Step 1: Clearing all cached credentials..."
gh auth logout --hostname github.com 2>/dev/null && echo "✓ Logged out of GitHub CLI" || echo "✓ Already logged out"
rm -f ~/.git-credentials && echo "✓ Removed stored credentials"
git config --global --unset credential.helper 2>/dev/null && echo "✓ Unset credential helper" || echo "✓ No credential helper was set"
echo ""

# Step 2: Check authentication status
echo "Step 2: Verifying clean state..."
if gh auth status 2>&1 | grep -q "not logged in"; then
    echo "✓ Successfully cleared all authentication"
else
    echo "⚠ Warning: Still appears to be logged in"
fi
echo ""

# Step 3: Instructions for authentication
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Next Steps: Authenticate with your PAT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Get your Personal Access Token (PAT):"
echo "   → https://github.com/settings/tokens"
echo "   → Click 'Generate new token (classic)'"
echo "   → Select scope: repo (Full control of private repositories)"
echo "   → Copy the token"
echo ""
echo "2. Run this command and paste your PAT:"
echo "   echo \"YOUR_PAT\" | gh auth login --with-token"
echo ""
echo "   Or use the interactive method:"
echo "   gh auth login --with-token"
echo "   (Then paste your PAT and press Ctrl+D)"
echo ""
echo "3. Configure Git to store credentials:"
echo "   git config --global credential.helper store"
echo ""
echo "4. Test it works:"
echo "   git push"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "For detailed instructions, see:"
echo "  → docs/TERMINAL_ONLY_AUTH.md"
echo "  → docs/GIT_AUTH_TROUBLESHOOTING.md"
echo ""
