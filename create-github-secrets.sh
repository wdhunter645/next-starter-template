#!/bin/bash

# Script to read variables from .env file and create GitHub repository secrets
# Usage: ./create-github-secrets.sh [--dry-run] [--repo OWNER/REPO]

set -e

# Show help if requested
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: ./create-github-secrets.sh [OPTIONS]"
    echo ""
    echo "Read variables from .env file and create GitHub repository secrets"
    echo ""
    echo "OPTIONS:"
    echo "  --dry-run         Test mode - shows what would be done without creating secrets"
    echo "  --repo OWNER/REPO Specify target repository (default: auto-detect from git remote)"
    echo "  --help, -h        Show this help message"
    echo ""
    echo "PREREQUISITES:"
    echo "  - GitHub CLI (gh) must be installed"
    echo "  - GitHub CLI must be authenticated (run: gh auth login)"
    echo "  - .env file must exist in the current directory"
    echo ""
    echo "See SECRETS_SETUP.md for detailed documentation"
    exit 0
fi

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found in current directory${NC}"
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Parse command line arguments
DRY_RUN=false
REPO=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --repo)
            REPO="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Error: Unknown option: $1${NC}"
            echo "Run with --help for usage information"
            exit 1
            ;;
    esac
done

# Auto-detect repository from git remote if not specified
if [ -z "$REPO" ]; then
    if git remote get-url origin &> /dev/null; then
        # Extract owner/repo from git remote URL
        REMOTE_URL=$(git remote get-url origin)
        # Handle both HTTPS and SSH URLs
        if [[ "$REMOTE_URL" =~ github\.com[:/]([^/]+/[^/\.]+) ]]; then
            REPO="${BASH_REMATCH[1]}"
            echo -e "${GREEN}Auto-detected repository: ${REPO}${NC}"
        else
            echo -e "${RED}Error: Could not parse repository from git remote URL${NC}"
            echo "Please specify repository with --repo OWNER/REPO"
            exit 1
        fi
    else
        echo -e "${RED}Error: Could not auto-detect repository from git remote${NC}"
        echo "Please specify repository with --repo OWNER/REPO"
        exit 1
    fi
fi

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Running in DRY-RUN mode - no secrets will be created${NC}"
    echo ""
fi

# Check if gh is authenticated (skip in dry-run mode)
if [ "$DRY_RUN" = false ]; then
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI is not authenticated${NC}"
        echo "Please run: gh auth login"
        exit 1
    fi
fi

# Count total variables
TOTAL_VARS=$(grep -c "^[A-Z_].*=" .env || echo 0)
echo -e "${GREEN}Found ${TOTAL_VARS} variables in .env file${NC}"
echo ""

# Counter for successful operations
SUCCESS_COUNT=0
FAILED_COUNT=0

# Read .env file line by line
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Check if line contains a variable (KEY=VALUE format)
    if [[ "$line" =~ ^[A-Z_][A-Z0-9_]*= ]]; then
        # Extract variable name (everything before the first =)
        VAR_NAME=$(echo "$line" | cut -d'=' -f1)
        
        # Extract variable value (everything after the first =)
        VAR_VALUE=$(echo "$line" | cut -d'=' -f2-)
        
        echo -e "${YELLOW}Processing: ${VAR_NAME}${NC}"
        
        if [ "$DRY_RUN" = true ]; then
            echo "  Would create secret: ${VAR_NAME}"
            echo "  Value length: ${#VAR_VALUE} characters"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            # Create the secret using gh CLI
            if echo "$VAR_VALUE" | gh secret set "$VAR_NAME" --repo "$REPO"; then
                echo -e "  ${GREEN}✓ Successfully created secret: ${VAR_NAME}${NC}"
                SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
            else
                echo -e "  ${RED}✗ Failed to create secret: ${VAR_NAME}${NC}"
                FAILED_COUNT=$((FAILED_COUNT + 1))
            fi
        fi
        echo ""
    fi
done < .env

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Summary:${NC}"
echo "  Total variables processed: $((SUCCESS_COUNT + FAILED_COUNT))"
echo -e "  ${GREEN}Successful: ${SUCCESS_COUNT}${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "  ${RED}Failed: ${FAILED_COUNT}${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${YELLOW}This was a DRY-RUN. To actually create the secrets, run:${NC}"
    echo "  ./create-github-secrets.sh"
fi

# Exit with error if any failed
if [ $FAILED_COUNT -gt 0 ]; then
    exit 1
fi
