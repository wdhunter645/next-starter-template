# Scripts Directory

This directory contains helper scripts for operational tasks and automation.

## Available Scripts

### 1. deploy-orchestrator.sh

**Purpose:** Automated deployment pipeline for staging and production environments with smoke testing.

**Usage:**
```bash
# Run full deployment pipeline
./scripts/deploy-orchestrator.sh

# Run and post comment to specific PR/issue
./scripts/deploy-orchestrator.sh 123
```

**What it does:**
1. Validates required secrets (CF_API_TOKEN, CF_ACCOUNT_ID, OPENAI_API_KEY)
2. Deploys to staging via GitHub Actions
3. Runs smoke tests against staging (test.lougehrigfanclub.com)
4. Deploys to production via GitHub Actions
5. Runs smoke tests against production (www.lougehrigfanclub.com)
6. Posts deployment summary with results

**Requirements:**
- GitHub CLI (`gh`) installed and authenticated
- `curl` for HTTP smoke tests
- `jq` for JSON parsing
- Repository secrets configured

**Exit codes:**
- `0` - All deployments and smoke tests passed
- `1` - Preconditions failed, deployment failed, or smoke tests failed

**See also:** [../docs/DEPLOYMENT_ORCHESTRATOR.md](../docs/DEPLOYMENT_ORCHESTRATOR.md) for detailed documentation.

---

### 2. md_secret_audit.sh

**Purpose:** Scans markdown files for potential secrets and sensitive patterns.

**Usage:**
```bash
# Direct execution
./scripts/md_secret_audit.sh

# Via npm script (recommended)
npm run audit:docs
```

**What it scans:**
- API keys, secrets, tokens, passwords
- Cloud provider credentials (Supabase, Cloudflare, AWS)
- JWT-like tokens (eyJ...)
- URLs containing tokens

**Exit codes:**
- `0` - No secrets found (pass)
- `1` - Potential secrets detected (fail)

**Output:**
- Colorized terminal output
- Lists all files with findings
- Shows matched lines with line numbers
- Provides actionable guidance

**CI Integration:**
- Runs automatically on PRs that modify `**/*.md` files
- See `.github/workflows/docs-audit.yml`

---

### 3. create-parent-issue.sh

**Purpose:** Creates the parent tracking issue "Operational Backlog from After-Action Reports".

**Usage:**
```bash
./scripts/create-parent-issue.sh
```

**Requirements:**
- GitHub CLI (`gh`) installed and authenticated
- Run from repository root

**What it creates:**
- Issue title: "Operational Backlog from After-Action Reports"
- Labels: `ops`, `backlog`, `automation`, `security`
- Body with:
  - Overview of PRs #79-#82
  - Status of each PR (merged/open)
  - Key tasks checklist
  - Links to all related PRs

**Output:**
- Issue URL (note the issue number for next step)

---

### 4. post-parent-status.sh

**Purpose:** Posts a comprehensive status report on the parent issue.

**Usage:**
```bash
./scripts/post-parent-status.sh <issue-number>
```

**Requirements:**
- GitHub CLI (`gh`) installed and authenticated
- Parent issue must exist (create with `create-parent-issue.sh` first)
- Run from repository root

**What it posts:**
- **What Changed:** Summary of all 4 PRs (#79-#82)
- **CI/CD Status:** Build/lint/Cloudflare verdict
- **Outstanding Items:** Tasks with owners
- **Merge Plan:** Ready/blocked/order
- **Build Evidence:** Actual output snippets
- **Cloudflare Status:** Investigation results
- **Documentation:** Links to guides

**Example:**
```bash
# After creating parent issue
./scripts/create-parent-issue.sh
# Output: https://github.com/.../issues/123

# Post status report
./scripts/post-parent-status.sh 123
```

---

## Quick Start Workflows

### Automated Deployment (Staging + Production)

Deploy to both staging and production with automated smoke testing:

```bash
# Ensure GitHub CLI is authenticated
gh auth status || gh auth login

# Run full deployment pipeline
./scripts/deploy-orchestrator.sh

# Or post results to a specific PR/issue
./scripts/deploy-orchestrator.sh 456
```

**Total time:** ~10-15 minutes (depending on build times)

---

### After-Action Backlog Finalization

Complete the after-action backlog finalization in 4 steps:

```bash
# 1. Test secret audit (verify it works)
npm run audit:docs

# 2. Create parent tracking issue
./scripts/create-parent-issue.sh
# Note the issue number from output (e.g., #123)

# 3. Post comprehensive status report
./scripts/post-parent-status.sh 123

# 4. Follow ACCEPTANCE_CHECKS_TEMPLATES.md to update PR descriptions
```

**Total time:** ~15 minutes

---

## Troubleshooting

### "gh: command not found"

Install GitHub CLI:
- macOS: `brew install gh`
- Linux: See https://cli.github.com/
- Windows: `winget install GitHub.cli`

Then authenticate:
```bash
gh auth login
```

### "Not in a git repository"

Run scripts from the repository root:
```bash
cd /path/to/next-starter-template
./scripts/create-parent-issue.sh
```

### "Permission denied"

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Secret audit finds too many matches

This is expected! The audit script detects:
1. **Documentation examples** - Placeholders like `YOUR_KEY_HERE`
2. **Environment variable names** - Like `CLOUDFLARE_API_TOKEN`
3. **Setup guides** - Configuration instructions

**Action:** Review findings to ensure no ACTUAL credentials are exposed.

**Common patterns (safe):**
- `GITHUB_APP_CLIENT_SECRET=your_secret_here` → Placeholder
- `CF_PAGES_COMMIT_SHA` → Env var reference
- `TURNSTILE_SECRET (secret)` → Type annotation in docs

**Actual secrets look like:**
- `sk_live_51ABC...` → Stripe key
- `eyJhbGciOi...` → Real JWT token
- API keys with random characters

---

## CI/CD Integration

### Docs Audit Workflow

File: `.github/workflows/docs-audit.yml`

**Triggers:**
- Pull requests that modify `**/*.md` files

**Steps:**
1. Checkout with full history
2. Setup Node 20
3. Install dependencies (`npm ci`)
4. Run `npm run audit:docs`
5. Post PR comment on failure

**Permissions:**
- `contents: read` - To checkout code
- `pull-requests: write` - To post comments

**Comment on failure:**
```
🔒 **Docs Secret Audit Failed**

Potential secrets or sensitive patterns detected in markdown files. 
Please review the workflow logs and remove any actual credentials 
before merging.

Run `npm run audit:docs` locally to see detailed findings.
```

---

## Development

### Adding a new script

1. Create script in `scripts/` directory
2. Add shebang: `#!/usr/bin/env bash`
3. Set error handling: `set -euo pipefail`
4. Make executable: `chmod +x scripts/your-script.sh`
5. Add documentation to this README
6. Test thoroughly before committing

### Script conventions

- Use `bash` (not `sh`)
- Set `set -euo pipefail` for safety
- Use `read -r -d '' VAR << 'EOF'` for multi-line strings
- Check for required tools (e.g., `command -v gh`)
- Provide clear error messages
- Use colorized output when helpful
- Exit with appropriate codes (0=success, 1=error)

---

## Documentation

For complete implementation details, see:

- **AFTER_ACTION_FINALIZATION.md** - Main implementation guide
- **ACCEPTANCE_CHECKS_TEMPLATES.md** - A→G templates for PR descriptions
- **SUMMARY_FINALIZATION.md** - Executive summary

---

## Support

For questions or issues:

1. Check documentation files listed above
2. Review script source code (well-commented)
3. Check GitHub Actions logs for CI failures
4. Open an issue on the repository

---

_Last updated: 2025-10-17_
