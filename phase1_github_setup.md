# Phase 1 GitHub Setup Guide

**Purpose:** Set up GitHub infrastructure for Phase 1 of the operational backlog (Foundation items).

**Created:** 2025-10-20  
**Status:** Active  
**Target Repository:** wdhunter645/next-starter-template

---

## Overview

Phase 1 focuses on establishing a clean foundation by addressing critical and high-priority items:

1. **Issue #3: Verify Security Incident Remediation** (CRITICAL) ⚠️
2. **Issue #2: Archive After-Action Reports** (Quick win)
3. **Issue #1: Consolidate Documentation Architecture** (High value)

This guide walks through creating the necessary GitHub issues, labels, and project structure to track Phase 1 work.

---

## Prerequisites

### Required Tools
- GitHub CLI (`gh`) installed and authenticated
- Git configured with repository access
- Terminal access to repository root

### Verify GitHub CLI Authentication
```bash
gh auth status
```

If not authenticated:
```bash
gh auth login
```

### Verify Repository Access
```bash
cd /home/runner/work/next-starter-template/next-starter-template
git remote -v
```

---

## Phase 1 Quick Start

### Option 1: Automated Setup (Recommended)

Use the provided script to create all issues at once:

```bash
# Navigate to repository root
cd /home/runner/work/next-starter-template/next-starter-template

# Run the automated script
./create-backlog-issues.sh

# When prompted, choose option 2 (High priority only)
# This creates Issues 1-3 (Phase 1)
```

The script will:
1. ✅ Create parent tracking issue
2. ✅ Create Issues 1, 2, and 3 with proper labels
3. ✅ Auto-link sub-issues to parent issue
4. ✅ Output all issue numbers for reference

### Option 2: Manual Step-by-Step Setup

Follow the detailed steps below if you prefer manual control or need to troubleshoot.

---

## Step-by-Step Manual Setup

### Step 1: Create Required Labels

Ensure these labels exist in your repository before creating issues:

```bash
# Navigate to repository
cd /home/runner/work/next-starter-template/next-starter-template

# Create labels (only if they don't exist)
gh label create "ops" --color "0E8A16" --description "Operational tasks" || true
gh label create "backlog" --color "D93F0B" --description "Backlog items" || true
gh label create "automation" --color "1D76DB" --description "Automation improvements" || true
gh label create "docs" --color "0075CA" --description "Documentation" || true
gh label create "cleanup" --color "FEF2C0" --description "Code/doc cleanup" || true
gh label create "high-priority" --color "D93F0B" --description "High priority items" || true
gh label create "security" --color "D93F0B" --description "Security related" || true
gh label create "audit" --color "FBB040" --description "Audit tasks" || true
gh label create "good-first-issue" --color "7057FF" --description "Good for newcomers" || true
```

**Verification:**
```bash
gh label list | grep -E "ops|backlog|automation|docs|cleanup|high-priority|security|audit"
```

### Step 2: Create Parent Tracking Issue

```bash
# Create parent issue
gh issue create \
  --title "Operational Backlog from After-Action Reports" \
  --body-file docs/issues-templates/PARENT_ISSUE.md \
  --label "ops,backlog,automation" \
  --repo wdhunter645/next-starter-template
```

**Expected output:** URL like `https://github.com/wdhunter645/next-starter-template/issues/123`

**Record the issue number:**
```bash
# Example: If output is .../issues/123
export PARENT_ISSUE=123
echo "Parent issue: #$PARENT_ISSUE"
```

### Step 3: Update Sub-Issue Templates

Before creating sub-issues, update them with the parent issue number:

```bash
# Replace placeholder with actual parent issue number
# Assumes PARENT_ISSUE is set from Step 2
for template in docs/issues-templates/ISSUE_*.md; do
  if [ -f "$template" ]; then
    sed -i "s/#{PARENT_ISSUE_NUMBER}/#$PARENT_ISSUE/g" "$template"
  fi
done

echo "✓ Templates updated with parent issue #$PARENT_ISSUE"
```

### Step 4: Create Phase 1 Sub-Issues

#### Issue 1: Consolidate Documentation Architecture

```bash
gh issue create \
  --title "Consolidate Documentation Architecture" \
  --body-file docs/issues-templates/ISSUE_01_CONSOLIDATE_DOCS.md \
  --label "docs,cleanup,high-priority" \
  --repo wdhunter645/next-starter-template
```

**What this issue addresses:**
- Consolidates 5+ overlapping authentication guides
- Creates clear documentation hierarchy
- Improves developer onboarding experience
- **Estimated effort:** 2-3 hours

#### Issue 2: Archive After-Action Reports

```bash
gh issue create \
  --title "Archive After-Action Reports" \
  --body-file docs/issues-templates/ISSUE_02_ARCHIVE_REPORTS.md \
  --label "cleanup,docs,high-priority,good-first-issue" \
  --repo wdhunter645/next-starter-template
```

**What this issue addresses:**
- Moves 10+ completion reports from root directory
- Declutters repository structure
- Organizes historical documentation
- **Estimated effort:** 30 minutes
- **Note:** Marked as good-first-issue for contributors

#### Issue 3: Verify Security Incident Remediation (CRITICAL)

```bash
gh issue create \
  --title "Verify Security Incident Remediation" \
  --body-file docs/issues-templates/ISSUE_03_SECURITY_AUDIT.md \
  --label "security,audit,high-priority" \
  --repo wdhunter645/next-starter-template
```

**What this issue addresses:**
- Verifies all 18 exposed secrets have been rotated
- Documents credential rotation in security log
- Ensures security incident fully remediated
- **Estimated effort:** 2-3 hours
- **Priority:** CRITICAL - Start this first ⚠️

### Step 5: Verification Checklist

After creating all issues, verify the setup:

```bash
# List all open issues with ops label
gh issue list --label "ops" --state open

# Expected: Should show parent issue + 3 sub-issues
```

Manual verification checklist:
- [ ] Parent issue exists: "Operational Backlog from After-Action Reports"
- [ ] Issue 1 exists: "Consolidate Documentation Architecture"
- [ ] Issue 2 exists: "Archive After-Action Reports" (has good-first-issue label)
- [ ] Issue 3 exists: "Verify Security Incident Remediation" (has security label)
- [ ] All sub-issues reference parent issue in their body
- [ ] All issues have appropriate labels
- [ ] Issue numbers recorded for future reference

### Step 6: Record Issue Numbers

Create a quick reference for the created issues:

```bash
# Create a tracking file
cat > /tmp/phase1-issues.txt << 'EOF'
# Phase 1 GitHub Issues

Parent Issue: #____
Sub-Issue 1 (Consolidate docs): #____
Sub-Issue 2 (Archive reports): #____ ⭐ Good first issue
Sub-Issue 3 (Security audit): #____ ⚠️ CRITICAL - Start first

Created: $(date)
EOF

# Display
cat /tmp/phase1-issues.txt
```

Fill in the issue numbers and save for reference.

---

## Phase 1 Execution Plan

### Recommended Sequence

1. **Week 1, Day 1-2: Security Audit (Issue #3)**
   - **Priority:** CRITICAL
   - **Owner:** Repository owner (@wdhunter645) only
   - **Tasks:**
     - Audit all 18 exposed secrets
     - Verify rotation in Supabase, Cloudflare, GitHub
     - Document rotation dates in security log
     - Update .env.example if needed

2. **Week 1, Day 3: Archive Reports (Issue #2)**
   - **Priority:** Quick win
   - **Owner:** Any contributor
   - **Tasks:**
     - Create docs/archive/2025-10/ directory
     - Move 10 completion reports
     - Update root README if needed
     - Verify no broken links

3. **Week 1, Day 4-5: Consolidate Documentation (Issue #1)**
   - **Priority:** High value
   - **Owner:** Technical writer or experienced contributor
   - **Tasks:**
     - Audit 5 authentication guides
     - Create consolidated guide structure
     - Update cross-references
     - Archive duplicate content

### Parallel Work Opportunities

Issues #2 and #1 can be worked in parallel since they don't have dependencies:
- Contributor A: Works on Issue #2 (Archive Reports)
- Contributor B: Works on Issue #1 (Consolidate Docs)
- Repository Owner: Handles Issue #3 (Security Audit)

### Time Estimates

| Issue | Effort | Timeline |
|-------|--------|----------|
| #3 Security Audit | 2-3 hours | Days 1-2 |
| #2 Archive Reports | 30 minutes | Day 3 |
| #1 Consolidate Docs | 2-3 hours | Days 4-5 |
| **Total** | **5-6.5 hours** | **Week 1** |

---

## Working with Issues

### Creating Draft PRs

For each issue, create a draft PR early:

```bash
# Example for Issue #2 (Archive Reports)
git checkout -b feature/archive-reports
git push -u origin feature/archive-reports

# Create draft PR
gh pr create \
  --draft \
  --title "Archive after-action reports (Issue #2)" \
  --body "Relates to #2 (parent: #$PARENT_ISSUE)"
```

### Updating Issue Status

As you work, update the issue with progress comments:

```bash
# Post progress update
gh issue comment <ISSUE_NUMBER> --body "## Progress Update

- [x] Step 1 completed
- [x] Step 2 completed
- [ ] Step 3 in progress

**ETA:** Tomorrow"
```

### Closing Issues

When work is complete, close via PR:

```bash
# In PR description, add:
# Closes #<ISSUE_NUMBER>
# Part of #<PARENT_ISSUE>

# Mark PR as ready for review
gh pr ready

# Merge when approved (issues close automatically)
gh pr merge --squash
```

---

## Troubleshooting

### Problem: "gh: command not found"

**Solution:** Install GitHub CLI
```bash
# macOS
brew install gh

# Linux (Debian/Ubuntu)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### Problem: "authentication required"

**Solution:** Authenticate with GitHub
```bash
gh auth login

# For token-based auth (no browser)
echo "YOUR_PAT_TOKEN" | gh auth login --with-token
```

### Problem: "permission denied when creating issues"

**Solution:** Verify repository access
```bash
# Check authentication
gh auth status

# Verify repository access
gh repo view wdhunter645/next-starter-template
```

Required token scopes:
- `repo` - Full control of private repositories
- `write:discussion` - Read/write team discussions

### Problem: "label not found"

**Solution:** Create missing labels first
```bash
# Run Step 1 again to create all labels
gh label create "high-priority" --color "D93F0B" --description "High priority items"
```

### Problem: "template file not found"

**Solution:** Ensure you're in repository root
```bash
# Check current directory
pwd
# Should be: /home/runner/work/next-starter-template/next-starter-template

# Verify templates exist
ls -la docs/issues-templates/
```

### Problem: Script fails with "command not found"

**Solution:** Make script executable
```bash
chmod +x create-backlog-issues.sh
./create-backlog-issues.sh
```

---

## Verification and Testing

### Verify All Issues Created

```bash
# List all ops-labeled issues
gh issue list --label "ops" --state open --repo wdhunter645/next-starter-template

# Should show 4 issues:
# - 1 parent tracking issue
# - 3 Phase 1 sub-issues
```

### Verify Labels Applied Correctly

```bash
# Check labels for each issue
gh issue view <ISSUE_NUMBER> --json labels --jq '.labels[].name'
```

Expected labels:
- **Parent issue:** ops, backlog, automation
- **Issue #1:** docs, cleanup, high-priority
- **Issue #2:** cleanup, docs, high-priority, good-first-issue
- **Issue #3:** security, audit, high-priority

### Verify Cross-References

Open each sub-issue and verify it references the parent issue:
```bash
gh issue view <SUB_ISSUE_NUMBER> --json body --jq '.body' | grep -i "parent"
```

Should contain: "Part of #{PARENT_ISSUE}"

---

## Next Steps After Setup

### Immediate Actions

1. **Post status comment on parent issue:**
   ```bash
   gh issue comment $PARENT_ISSUE --body-file docs/issues-templates/STATUS_REPORT.md
   ```

2. **Assign owners to issues:**
   ```bash
   # Security audit must be assigned to repo owner
   gh issue edit <ISSUE_3_NUMBER> --add-assignee wdhunter645
   
   # Other issues can be assigned as appropriate
   gh issue edit <ISSUE_1_NUMBER> --add-assignee <username>
   gh issue edit <ISSUE_2_NUMBER> --add-assignee <username>
   ```

3. **Create GitHub Project (optional but recommended):**
   - Go to: https://github.com/wdhunter645/next-starter-template/projects
   - Create "Phase 1: Foundation" project
   - Add all Phase 1 issues to the project
   - Set up automation rules (issues → In Progress → Done)

### Ongoing Management

- **Daily:** Review issue comments and PR progress
- **Weekly:** Update parent issue with status comment
- **On PR merge:** Verify issue auto-closed, move to next item
- **Phase complete:** Create Phase 2 setup following similar process

---

## Success Criteria

Phase 1 GitHub setup is complete when:

- [x] Parent tracking issue created
- [x] All Phase 1 sub-issues (1, 2, 3) created
- [x] All issues have correct labels
- [x] All sub-issues reference parent issue
- [x] Issue numbers documented
- [x] Assignees added (especially Issue #3 to owner)
- [x] Status comment posted on parent issue
- [x] Team notified of Phase 1 kickoff

---

## Reference Links

### Documentation
- [Issue templates](./docs/issues-templates/)
- [Parent issue template](./docs/issues-templates/PARENT_ISSUE.md)
- [Operational backlog](./OPERATIONAL_BACKLOG.md)
- [Backlog setup instructions](./docs/backlog/SETUP_INSTRUCTIONS.md)

### GitHub Resources
- [Repository issues](https://github.com/wdhunter645/next-starter-template/issues)
- [Repository labels](https://github.com/wdhunter645/next-starter-template/labels)
- [Repository projects](https://github.com/wdhunter645/next-starter-template/projects)
- [GitHub CLI docs](https://cli.github.com/manual/)

### Scripts
- [create-backlog-issues.sh](./create-backlog-issues.sh) - Automated issue creation
- [Backlog README](./docs/backlog/README.md) - Backlog context

---

## Phase 1 Priorities Summary

Remember the Phase 1 execution order:

1. **🔴 CRITICAL: Issue #3 - Security Audit**
   - Rotate all exposed secrets
   - Verify in all services
   - Document in security log
   - **Start immediately**

2. **⚡ QUICK WIN: Issue #2 - Archive Reports**
   - Clean up root directory
   - Move 10 completion reports
   - Low effort, high value

3. **📚 HIGH VALUE: Issue #1 - Consolidate Docs**
   - Merge 5 overlapping guides
   - Create clear hierarchy
   - Improve onboarding

**Total Phase 1 effort:** 5-6.5 hours over Week 1

---

## Questions?

- **Issue creation:** See [docs/issues-templates/README.md](./docs/issues-templates/README.md)
- **Backlog context:** See [OPERATIONAL_BACKLOG.md](./OPERATIONAL_BACKLOG.md)
- **Technical questions:** Contact @wdhunter645
- **GitHub CLI help:** Run `gh issue create --help`

---

**Document version:** 1.0  
**Last updated:** 2025-10-20  
**Maintained by:** GitHub Copilot Workspace  
**For:** Phase 1 operational backlog setup
