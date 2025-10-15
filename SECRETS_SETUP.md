# GitHub Secrets Setup Script

This script (`create-github-secrets.sh`) automates the process of reading environment variables from the `.env` file and creating corresponding GitHub repository secrets.

## Prerequisites

1. **GitHub CLI (gh)** must be installed
   - Installation instructions: https://cli.github.com/
   
2. **GitHub CLI must be authenticated**
   ```bash
   gh auth login
   ```

3. **Appropriate permissions** - You must have admin access to the repository to create secrets

## Usage

### Dry Run (Test Mode)
To test the script without actually creating secrets:
```bash
./create-github-secrets.sh --dry-run
```

This will:
- Parse the `.env` file
- Show which secrets would be created
- Display the length of each value (without showing the actual value)
- Provide a summary of what would happen

### Create Secrets
To actually create the repository secrets:
```bash
./create-github-secrets.sh
```

## What the Script Does

1. Checks for the existence of the `.env` file
2. Verifies that GitHub CLI is installed and authenticated
3. Reads each line from the `.env` file
4. For each variable in the format `KEY=VALUE`:
   - Extracts the variable name
   - Creates a GitHub repository secret with that name and value
5. Provides a summary of successful and failed operations

## Important Notes

- The script creates secrets for the repository: `wdhunter645/next-starter-template`
- If you want to use this for a different repository, modify the `--repo` parameter in the script
- The script currently processes **18 variables** from the `.env` file
- Existing secrets with the same name will be overwritten
- Secret values are sent securely through the GitHub CLI

## Example Output

```
Found 18 variables in .env file

Processing: CLOUDFLARE_ACCOUNT_ID
  ✓ Successfully created secret: CLOUDFLARE_ACCOUNT_ID

Processing: CLOUDFLARE_API_TOKEN
  ✓ Successfully created secret: CLOUDFLARE_API_TOKEN

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary:
  Total variables processed: 18
  Successful: 18
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Troubleshooting

### "GitHub CLI is not authenticated"
Run `gh auth login` and follow the prompts to authenticate with GitHub.

### "Permission denied"
Make the script executable with:
```bash
chmod +x create-github-secrets.sh
```

### "Error: .env file not found"
Make sure you're running the script from the repository root directory where the `.env` file is located.

## Security Warning

⚠️ **Never commit the `.env` file to version control!** 

The `.env` file contains sensitive credentials and should remain in `.gitignore`.
