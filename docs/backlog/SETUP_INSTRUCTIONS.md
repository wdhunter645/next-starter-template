# Instructions for Completing PR #79 Setup

This document provides step-by-step instructions for completing the setup of PR #79 and the operational backlog.

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Write access to the repository
- PR #79 already exists

## Step 1: Create GitHub Issues

### Option A: Using the Script (Recommended)

```bash
# Run the automated script
./create-backlog-issues.sh
```

This will:
1. Create the parent issue with labels: `ops`, `backlog`, `automation`
2. Create 8 sub-issues with appropriate labels
3. Auto-link sub-issues to parent issue (via issue body)
4. Output the parent issue number

### Option B: Manual Creation

If you prefer to create issues manually or the script doesn't work:

1. **Create Parent Issue:**
   ```bash
   gh issue create --title "Operational Backlog from After-Action Reports" \
     --body-file docs/backlog/PARENT_ISSUE.md \
     --label "ops,backlog,automation"
   ```
   Note the issue number (let's say it's #80)

2. **Create Each Sub-Issue:**
   Replace `#[PARENT_ISSUE_NUMBER]` with the actual number before creating.
   
   ```bash
   # Sub-issue 1
   gh issue create --title "Consolidate duplicate authentication documentation into clear hierarchy" \
     --body-file docs/backlog/SUB_ISSUE_01_CONSOLIDATE_DOCS.md \
     --label "docs,cleanup,ops"
   
   # Sub-issue 2
   gh issue create --title "Archive after-action reports to declutter root directory" \
     --body-file docs/backlog/SUB_ISSUE_02_ARCHIVE_REPORTS.md \
     --label "cleanup,ops,documentation"
   
   # ... (repeat for all 8 sub-issues)
   ```

## Step 2: Update PR #79 Description

Once issues are created, update PR #79 description to include a checklist of sub-issues:

```markdown
# Operational Backlog Setup

This PR establishes the operational backlog from after-action reports.

## Backlog Structure

Parent Issue: #[PARENT_NUMBER] - Operational Backlog from After-Action Reports

## Sub-Issues Checklist

- [ ] #[N] - Consolidate duplicate documentation (High priority)
- [ ] #[N] - Archive after-action reports (Medium priority)
- [ ] #[N] - Rotate exposed secrets (CRITICAL priority) ⚠️
- [ ] #[N] - Add OAuth automated tests (High priority)
- [ ] #[N] - Automate deployment verification (Medium priority)
- [ ] #[N] - Enhance monitoring and logging (Medium priority)
- [ ] #[N] - Document token refresh implementation (Low priority)
- [ ] #[N] - Create unified onboarding guide (High priority)

## What This PR Contains

- Complete operational backlog specifications in `docs/backlog/`
- Parent issue template with 8 identified backlog items
- 8 detailed sub-issue specifications with A→G acceptance criteria
- Helper script for issue creation
- Documentation for managing the backlog

## Next Steps

1. ✅ Issues created (see checklist above)
2. 🔜 Link PR to parent issue
3. 🔜 Post status comment on parent issue
4. 🔜 Begin work on critical items (Issue #[N] - Rotate secrets)

## Related

- Closes #[PARENT_NUMBER]
- Part of operationalizing after-action reports
- Based on analysis of 6 completion reports
```

**How to update:**
```bash
gh pr edit 79 --body "$(cat path/to/updated/description.md)"
```

Or update via GitHub web UI: https://github.com/wdhunter645/next-starter-template/pull/79

## Step 3: Link PR #79 to Parent Issue

Add a comment on PR #79 linking it to the parent issue:

```bash
gh pr comment 79 --body "Relates to #[PARENT_NUMBER] - Operational Backlog from After-Action Reports"
```

Or in the PR description, add:
```markdown
Closes #[PARENT_NUMBER]
```

## Step 4: Post Status Comment on Parent Issue

Post the status comment on the parent issue:

```bash
# Create a file with the status comment
cat > /tmp/status-comment.md << 'EOF'
# Status Update: Operational Backlog

## What I Found

Analyzed 6 after-action reports documenting recent work:
- DEVCONTAINER_REMOVAL_COMPLETE.md
- IMPLEMENTATION_COMPLETE.md
- ISSUES_COMPLETE_REPORT.md
- SOLUTION_DELIVERED.md
- DEPLOYMENT_FIX.md
- OAUTH_IMPLEMENTATION_SUMMARY.md

**Key findings:**
- 🔴 Security issue: 18 secrets briefly exposed (needs rotation)
- 📚 Documentation proliferation: 5+ auth guides need consolidation
- ✅ Major implementations complete but lack automated tests
- 🔧 Maintenance opportunities: archival, monitoring, onboarding

## Backlog Created

Created 8 prioritized sub-issues:

1. **#[N]** - Consolidate duplicate documentation (High)
2. **#[N]** - Archive after-action reports (Medium)
3. **#[N]** - Rotate exposed secrets ⚠️ (CRITICAL)
4. **#[N]** - Add OAuth automated tests (High)
5. **#[N]** - Automate deployment verification (Medium)
6. **#[N]** - Enhance monitoring and logging (Medium)
7. **#[N]** - Document token refresh (Low)
8. **#[N]** - Create unified onboarding guide (High)

Each sub-issue includes:
- Clear problem statement
- Definition of Done
- Risks & assumptions
- Complete A→G acceptance criteria loop

## First PRs

PR #79 establishes the backlog structure. Two immediate follow-up PRs recommended:

1. **PR for Issue #[N]** (Critical): Rotate exposed secrets
   - Highest priority security remediation
   - Should be started immediately

2. **PR for Issue #[N]** (Quick win): Archive reports
   - Low complexity, immediate value
   - Cleans up repository root

## Next Up

**Recommended sequence:**

**Phase 1 (Week 1):**
- Issue #[N]: Rotate secrets (CRITICAL) ← Start now
- Issue #[N]: Archive reports (quick win)
- Issue #[N]: Consolidate docs (high value)

**Phase 2 (Week 2-3):**
- Issue #[N]: OAuth tests
- Issue #[N]: Onboarding guide
- Issue #[N]: Deployment automation

**Phase 3 (Future):**
- Issue #[N]: Monitoring/logging
- Issue #[N]: Token refresh docs (when ready to implement)

**Total effort:** ~20-27 hours over 2-3 weeks

---

*Posted by GitHub Copilot Agent as part of PR #79*
EOF

# Post the comment (replace [PARENT_NUMBER] with actual issue number)
gh issue comment [PARENT_NUMBER] --body-file /tmp/status-comment.md
```

**Important:** Replace all `#[N]` placeholders with actual issue numbers before posting.

## Step 5: Verification Checklist

After completing all steps, verify:

- [ ] Parent issue exists with labels: ops, backlog, automation
- [ ] 8 sub-issues exist with appropriate labels
- [ ] All sub-issues reference parent issue in their body
- [ ] PR #79 description updated with issue checklist
- [ ] PR #79 linked to parent issue (in description or comment)
- [ ] Status comment posted on parent issue
- [ ] All issue numbers correct (no placeholders)

## Quick Reference: Issue Numbers

After creation, record the issue numbers here for easy reference:

```
Parent Issue: #____
Sub-Issue 1 (Consolidate docs): #____
Sub-Issue 2 (Archive reports): #____
Sub-Issue 3 (Rotate secrets): #____ ⚠️ CRITICAL
Sub-Issue 4 (OAuth tests): #____
Sub-Issue 5 (Deploy automation): #____
Sub-Issue 6 (Monitoring): #____
Sub-Issue 7 (Token refresh docs): #____
Sub-Issue 8 (Onboarding guide): #____
```

## Troubleshooting

### "gh CLI not authenticated"
```bash
gh auth login
# Follow prompts to authenticate
```

### "Permission denied"
Ensure you have write access to the repository or contact @wdhunter645.

### "Issue body too long"
If issue bodies exceed GitHub limits, consider:
1. Shortening the body and linking to docs/backlog/*.md files
2. Creating issues via web UI with copy-paste
3. Splitting very long sections into separate comments

### Script fails with "command not found"
Ensure you're in the repository root:
```bash
cd /home/runner/work/next-starter-template/next-starter-template
./create-backlog-issues.sh
```

## Need Help?

- Check docs/backlog/README.md for detailed context
- Review individual issue files in docs/backlog/
- Reference PR #79 for original requirements
- Contact @wdhunter645 with questions
