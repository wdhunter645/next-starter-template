# OpenCode Workflow Setup

## Overview

The OpenCode workflow (`.github/workflows/opencode.yml`) enables automated code maintenance through issue/PR comments using AI-powered assistance.

## How It Works

1. **Trigger**: Comment `/oc` followed by your request on any issue or pull request
2. **Action**: The workflow runs using the Qwen/Qwen2.5-Coder-32B-Instruct model
3. **Response**: The bot processes your request and can make code changes, respond to questions, etc.

## Required Setup

### GitHub Secret: HF_TOKEN

The workflow requires a Hugging Face API token to access the AI model.

#### Steps to Create and Add HF_TOKEN:

1. **Get a Hugging Face Token**:
   - Go to https://huggingface.co/settings/tokens
   - Create a new token (read access is sufficient)
   - Copy the token value

2. **Add to GitHub Secrets**:
   - Go to your repository settings
   - Navigate to "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - Name: `HF_TOKEN`
   - Value: Paste your Hugging Face token
   - Click "Add secret"

#### Verify Secret Exists:

```bash
# Run this command to check if the secret is configured
gh secret list | grep HF_TOKEN
```

If the secret is missing, you'll see:
```
MISSING: repo secret HF_TOKEN
```

## Workflow Configuration

The workflow is configured with the following permissions:
- `id-token: write` - For OIDC token authentication
- `contents: write` - Allows pushing code changes
- `pull-requests: write` - Allows creating/updating PRs
- `issues: write` - Allows replying to comments

## Usage Examples

Comment on any issue or PR:
- `/oc fix the linting errors in this PR`
- `/oc add tests for the new feature`
- `/oc explain how this function works`
- `/oc refactor this code to improve readability`

## Troubleshooting

### Workflow Not Triggering

Check that:
1. The HF_TOKEN secret exists (see verification command above)
2. Your comment contains `/oc` 
3. The workflow file has correct YAML syntax

### Authentication Errors

If you see authentication errors in the workflow logs:
1. Verify the HF_TOKEN secret is set correctly
2. Check that the token hasn't expired
3. Ensure the token has the necessary permissions

## Diagnostic Commands

Run these commands to verify the setup:

```bash
# 1) Confirm workflow references the right secret name
grep -nE 'HF_TOKEN|secrets\.' .github/workflows/opencode.yml

# 2) Confirm the secret exists in GitHub
gh secret list | grep -E '^HF_TOKEN\b' || echo "MISSING: repo secret HF_TOKEN"

# 3) View workflow details
gh workflow view opencode.yml

# 4) List recent workflow runs
gh run list --workflow opencode.yml --limit 15
```
