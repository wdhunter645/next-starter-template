# Documentation Archive

This file contains links to documentation that has been removed or consolidated during the documentation refactor. These files are preserved in Git history for reference.

## Purpose

This archive maintains a record of removed documentation to:

- Provide historical context for project evolution
- Help locate information that was moved or consolidated
- Serve as reference for specific implementation details

## Archived Documentation

### Removed from `docs/` Directory

The following files were removed from the `docs/` directory. Their content has been consolidated into:

- [START_HERE.md](../START_HERE.md) - Getting started guide
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Deployment setup and configuration
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Common issues and solutions

**Archived files:**

- `BRANCH_CLEANUP.md` - Branch management procedures
- `CODESPACES_CRASH_RECOVERY.md` - Codespaces crash recovery steps (→ TROUBLESHOOTING.md)
- `CODESPACES_LOGOUT.md` - Codespaces logout procedures (→ TROUBLESHOOTING.md)
- `CODESPACES_TOKEN_SETUP.md` - Token setup guide (→ TROUBLESHOOTING.md)
- `CRASH_RECOVERY_IMPLEMENTATION.md` - Implementation details
- `DEVCONTAINER_FIX.md` - DevContainer configuration fixes
- `FIX_SUMMARY.md` - Historical fix summaries
- `GIT_AUTH_TROUBLESHOOTING.md` - Git authentication (→ TROUBLESHOOTING.md)
- `IMPLEMENTATION_SUMMARY.md` - Historical implementation notes
- `QUICK_FIX.md` - Quick fixes (→ TROUBLESHOOTING.md)
- `SECURITY_NOTICE.md` - Security notices (preserved in README.md)
- `TERMINAL_ONLY_AUTH.md` - Terminal authentication (→ TROUBLESHOOTING.md)

### Removed from Root Directory

The following files were removed from the repository root. Relevant content has been integrated into the main documentation:

**Deployment-related:**

- `CLOUDFLARE_BUILD_REVIEW.md` - Build review procedures
- `CLOUDFLARE_SETUP_CHECKLIST.md` - Setup checklist (→ DEPLOYMENT_GUIDE.md)
- `CLOUDFLARE_WORKER_DEPLOYMENT.md` - Worker deployment details
- `DEPLOYMENT_DEBUG_SUMMARY.md` - Debug summaries
- `DEPLOYMENT_FIX.md` - Deployment fixes
- `DEPLOYMENT_FIX_COMPLETE.md` - Fix completion notes
- `DEPLOYMENT_FIX_NEEDED.md` - Required fixes
- `DEPLOYMENT_FIX_SUMMARY.md` - Fix summaries
- `DEPLOYMENT_TROUBLESHOOTING.md` - Deployment troubleshooting (→ DEPLOYMENT_GUIDE.md)
- `FIX_DEPLOYMENTS_NOW.md` - Urgent deployment fixes
- `RETRY_PR135_GUIDE.md` - PR retry guide
- `ROLLBACK_INSTRUCTIONS.md` - Rollback procedures (→ DEPLOYMENT_GUIDE.md)
- `ROLLBACK_SUMMARY.md` - Rollback summaries
- `SECRETS_SETUP.md` - Secrets configuration (→ DEPLOYMENT_GUIDE.md)

**Implementation and workflow:**

- `DIAGNOSIS_SUMMARY.md` - Diagnostic summaries
- `IMPLEMENTATION_COMPLETE.md` - Implementation completion notes
- `IMPLEMENTATION_SUMMARY.md` - Implementation summaries
- `INVESTIGATION_COMPLETE.md` - Investigation notes
- `REPOSITORY_METADATA_IMPLEMENTATION.md` - Metadata setup
- `SOLUTION_DELIVERED.md` - Solution delivery notes
- `TASK_SUMMARY.md` - Task summaries
- `WORKFLOW_FIX_SUMMARY.md` - Workflow fix summaries
- `WORKFLOW_REVIEW_PR144.md` - PR review notes

**Migrated:**

- `START_HERE.md` (root) - Moved to `docs/START_HERE.md` with improvements

## How to Access Archived Files

Archived files can be accessed through Git history:

```bash
# View list of all archived files
git log --all --full-history --oneline -- "*.md"

# View specific archived file
git show <commit-hash>:path/to/file.md

# Search for content in archived files
git log -S "search term" --source --all -- "*.md"
```

## Current Documentation Structure

The simplified documentation structure is:

```
docs/
├── START_HERE.md          # Getting started guide
├── DEPLOYMENT_GUIDE.md    # Deployment setup and troubleshooting
├── TROUBLESHOOTING.md     # Common issues and solutions
└── ARCHIVE.md             # This file

Root:
├── README.md              # Project overview and quick links
└── CONTRIBUTING.md        # Contribution guidelines
```

## Need Information?

If you're looking for information that was in archived files:

1. **Check current documentation first** - Most content has been consolidated
2. **Search this archive** - Find which file contained the information
3. **Check Git history** - Use commands above to view archived content
4. **Ask in issues** - Open an issue if you need specific historical context

## Maintenance

This archive should be updated when:

- Additional documentation is removed or consolidated
- File locations change significantly
- Historical references need clarification

Last updated: 2025-11-03
