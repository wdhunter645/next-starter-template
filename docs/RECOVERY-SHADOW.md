# Recovery and Rollback Procedures

This document describes procedures for recovering from repository issues using snapshots and git commands.

## Overview

Repository snapshots provide deterministic reference points for rollback audits and recovery operations. Combined with git's version control capabilities, you can quickly restore to a known-good state.

## Snapshot Locations

- **Snapshot Directory**: `/snapshots/`
- **Organized by Date**: `snapshots/YYYY-MM-DD/repo-snapshot-YYYYMMDDTHHMMSSz.json`
- **Smoketest Verification**: `snapshots/_smoketest.txt`

## Identifying Last Known Good State

### Using Snapshots

1. Navigate to the `snapshots/` directory
2. Browse snapshots by date to find the last successful deployment
3. Open the JSON snapshot file to view:
   - Commit SHA
   - Branch name
   - Author and timestamp
   - Changed files
   - Package version

### Using Cloudflare Pages Logs

1. Access Cloudflare Pages dashboard
2. Find the last successful deployment
3. Note the commit hash from the deployment details
4. Cross-reference with snapshots for additional context

### Using Git History

```bash
# View recent commits
git log --oneline -20

# View commits with dates
git log --pretty=format:"%h - %an, %ar : %s" -10

# View commits for a specific file
git log --follow -- path/to/file
```

## Recovery Methods

### Method 1: Revert to Last Known Good (Recommended)

This method preserves history and is safe for collaborative environments.

```bash
# 1. Ensure you're on main branch
git checkout main

# 2. Identify the bad commit range
# Replace <bad-commit> with the first bad commit SHA
# This reverts all commits from <bad-commit> to HEAD

git revert --no-edit <bad-commit>..HEAD

# 3. Push the revert commits
git push origin main
```

**Advantages**:
- Preserves full history
- Safe for collaborative workflows
- No force-push required

**Use When**:
- Multiple collaborators are working on the repository
- You need to maintain audit trail
- The bad changes are recent (last few commits)

### Method 2: Reset to Specific Commit (Admin Only)

⚠️ **WARNING**: This method rewrites history. Use only when necessary and coordinate with all team members.

```bash
# 1. Ensure you're on main branch
git checkout main

# 2. Backup current state (optional but recommended)
git branch backup-$(date +%Y%m%d-%H%M%S)

# 3. Reset to known-good commit
# Replace <good-commit> with the commit SHA from snapshot
git reset --hard <good-commit>

# 4. Force push with lease (safer than --force)
git push --force-with-lease origin main
```

**Advantages**:
- Clean history
- Complete removal of bad commits
- Smaller repository size

**Use When**:
- You are the sole contributor or have coordinated with all team members
- Bad commits contain sensitive data that must be removed
- The commit history is corrupted beyond repair

**Important Notes**:
- All team members must re-clone or reset their local repositories
- Open pull requests based on the removed commits will become invalid
- Always use `--force-with-lease` instead of `--force` for safety

### Method 3: Cherry-Pick Specific Changes

Use when you want to selectively apply good commits while skipping bad ones.

```bash
# 1. Create a new branch from known-good commit
git checkout -b recovery-branch <good-commit>

# 2. Cherry-pick specific good commits
git cherry-pick <commit-sha-1>
git cherry-pick <commit-sha-2>

# 3. Test the recovered state
npm install
npm run build
npm test

# 4. If tests pass, update main
git checkout main
git reset --hard recovery-branch
git push --force-with-lease origin main
```

### Method 4: Emergency Rollback via Cloudflare

If the git repository is in a good state but deployment is broken:

1. Log into Cloudflare Pages dashboard
2. Navigate to **Deployments**
3. Find the last known good deployment (check snapshots for commit SHA)
4. Click **Rollback to this deployment**
5. Verify the site is working
6. Update repository to match deployed state if needed

## Verification After Recovery

After any recovery operation, verify the repository state:

```bash
# 1. Check current commit
git log -1

# 2. Verify working tree is clean
git status

# 3. Run tests
npm install
npm run build
npm test

# 4. Test deployment locally
npm run dev
# Visit http://localhost:3000 and verify functionality
```

## Creating a Manual Snapshot

To create a reference point before risky operations:

```bash
# Run the snapshot script
bash scripts/snapshot_repo.sh

# Or trigger via GitHub Actions
# Navigate to Actions → Repository Snapshot → Run workflow
```

## Common Recovery Scenarios

### Scenario 1: Build Broken by Recent Commit

```bash
# Find the commit that broke the build
git log --oneline -10

# Revert the bad commit
git revert <bad-commit-sha>
git push origin main
```

### Scenario 2: Multiple Bad Commits

```bash
# Revert range of commits
git revert --no-edit <first-bad>^..<last-bad>
git push origin main
```

### Scenario 3: Accidental Deletion of Files

```bash
# Restore specific file from last good commit
git checkout <good-commit> -- path/to/file

# Commit the restoration
git commit -m "Restore accidentally deleted file"
git push origin main
```

### Scenario 4: Need to Go Back Several Days

```bash
# Find commit from specific date using snapshots
# Look in snapshots/YYYY-MM-DD/ for the date you need

# Reset to that commit (use Method 1 or 2 above)
git revert --no-edit <bad-commit>..HEAD
git push origin main
```

## Prevention Best Practices

1. **Always Create Snapshots** before major changes
2. **Test Locally** before pushing to main
3. **Use Pull Requests** for code review
4. **Enable Branch Protection** to prevent direct pushes to main
5. **Monitor Deployments** via Cloudflare Pages
6. **Review Snapshots** regularly to understand repository evolution

## Snapshot Review Cadence

Per `/docs/website-PR-governance.md`:
- Snapshots are generated daily at 07:00 UTC
- Review snapshots weekly for drift detection
- Compare snapshots before/after major deployments
- Archive or remove snapshots older than 90 days

## Emergency Contacts

If recovery procedures fail:
1. Check `/docs/TROUBLESHOOTING.md` for additional guidance
2. Review Cloudflare Pages logs for deployment-specific issues
3. Consult git documentation: https://git-scm.com/docs
4. Create an issue in the repository with snapshot references

## Additional Resources

- Git Documentation: https://git-scm.com/docs
- Git Revert Guide: https://git-scm.com/docs/git-revert
- Git Reset Guide: https://git-scm.com/docs/git-reset
- Snapshot README: `/snapshots/README.md`
- PR Governance: `/docs/website-PR-governance.md`
