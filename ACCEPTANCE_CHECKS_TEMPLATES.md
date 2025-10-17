# Acceptance Checks (A→G) Templates for PRs #79-#82

## For PR #79: Operationalize after-action reports

```markdown
---

## Acceptance Checks (A→G)

### A) Preconditions verified
- [x] Local dev env clean (git status clean)
- [x] No local .env changes required

### B) Implementation steps executed
- [x] Changeset is docs/scaffolding only
- [x] Archived 7 completion reports to docs/archive/
- [x] Created OPERATIONAL_BACKLOG.md
- [x] Built 10+ issue templates with A→G criteria

### C) Repo health checks pass
- [x] npm install
- [x] npm run build - ✓ Compiled successfully
- [x] npm run lint - ✓ No errors

### D) Minimal e2e verification complete
- [x] All routes still load
- [x] Root directory cleaned up (20+ → 10 .md files)
- [x] Archive structure verified (docs/archive/README.md exists)

### E) Artifacts updated
- [x] docs/archive/README.md - Comprehensive archive index created
- [x] OPERATIONAL_BACKLOG.md - Master backlog document created
- [x] docs/issues-templates/ - 10+ templates created

### F) Link PR(s) and reference parent
- [ ] **Tracks**: #<PARENT_ISSUE_NUMBER>

### G) Post-implementation note

**Implemented:** Operationalized 7 after-action completion reports by archiving them with git history preservation, extracting 10 prioritized backlog items, and creating comprehensive issue templates with A→G acceptance criteria. Repository root directory reduced from 20+ to 10 markdown files.

**Rollback:**
```bash
# Restore reports to root
git revert <commit-sha>

# Or manually:
git mv docs/archive/2025-10-16-*.md .
rm -rf docs/archive/README.md docs/issues-templates/ OPERATIONAL_BACKLOG.md
```
```

---

## For PR #80: Create operational backlog with automation

```markdown
---

## Acceptance Checks (A→G)

### A) Preconditions verified
- [x] Local dev env clean (git status clean)
- [x] No local .env changes required

### B) Implementation steps executed
- [x] Analyzed 6 after-action reports
- [x] Created 8 prioritized backlog items (20-27h estimated)
- [x] Built comprehensive issue specifications
- [x] Created automation script for GitHub issue creation

### C) Repo health checks pass
- [x] npm install
- [x] npm run build - ✓ Compiled successfully
- [x] npm run lint - ✓ No errors

### D) Minimal e2e verification complete
- [x] docs/backlog/ structure verified
- [x] create-backlog-issues.sh syntax validated
- [x] All markdown links checked
- [x] Documentation is comprehensive and actionable

### E) Artifacts updated
- [x] docs/backlog/README.md - Complete index
- [x] docs/backlog/PARENT_ISSUE.md - Parent issue spec
- [x] docs/backlog/SUB_ISSUE_*.md - 8 detailed sub-issue specs
- [x] PR_79_README.md - Implementation overview
- [x] create-backlog-issues.sh - Automation script

### F) Link PR(s) and reference parent
- [ ] **Tracks**: #<PARENT_ISSUE_NUMBER>

### G) Post-implementation note

**Implemented:** Created comprehensive operational backlog from 6 after-action reports, identifying 8 prioritized items including CRITICAL security finding (18 exposed secrets). Built complete issue specifications with A→G acceptance loops and automation script for GitHub issue creation. Total documentation: ~85KB across 15 files.

**Security finding:** Repository owner must rotate 18 exposed credentials (see OPERATIONAL_BACKLOG.md Issue #3).

**Rollback:**
```bash
# Remove backlog documentation
rm -rf docs/backlog/ PR_79_README.md create-backlog-issues.sh

# Or revert commit
git revert <commit-sha>
```
```

---

## For PR #81: Add Social Wall page

```markdown
---

## Acceptance Checks (A→G)

### A) Preconditions verified
- [x] Local dev env clean (git status clean)
- [x] No .env changes required (Elfsight hosted)

### B) Implementation steps executed
- [x] Created src/app/social/page.tsx
- [x] Embedded Elfsight Social Feed widget (ID: 805f3c5c-67cd-4edf-bde6-2d5978e386a8)
- [x] Used Next.js <Script> component with lazyOnload strategy
- [x] No CSP updates needed (none configured in repo)

### C) Repo health checks pass
- [x] npm install
- [x] npm run build - ✓ Compiled successfully
- [x] npm run lint - ✓ No errors

### D) Minimal e2e verification complete
- [x] Visit /social loads correctly
- [x] Widget container properly structured in HTML
- [x] Script loads with lazyOnload strategy
- [x] No hydration warnings
- [x] No console errors

### E) Artifacts updated
- [x] Screenshot added to PR description
- [x] Route /social appears in build output (2.02 kB, 103 kB First Load)

### F) Link PR(s) and reference parent
- [x] **Closes**: #77 (Add Social Wall page using Elfsight embed)
- [ ] **Tracks**: #<PARENT_ISSUE_NUMBER>

### G) Post-implementation note

**Implemented:** Added public /social page with Elfsight Social Feed widget displaying club posts from Facebook and Instagram. Page uses Next.js App Router, lazy-loads external script for optimal performance, and renders correctly without authentication. Build output shows route as 2.02 kB statically pre-rendered.

**Rollback:**
```bash
# Remove social page
rm src/app/social/page.tsx

# Or revert commit
git revert <commit-sha>
```
```

---

## For PR #82: .gitignore hardening and acceptance checks

```markdown
---

## Acceptance Checks (A→G)

### A) Preconditions verified
- [x] Local dev env clean (git status clean)
- [x] No .env changes required

### B) Implementation steps executed
- [x] Updated .gitignore with documentation artifact patterns
- [x] Created scripts/md_secret_audit.sh (secret scanning)
- [x] Added .github/workflows/docs-audit.yml (CI automation)
- [x] Updated package.json with audit:docs script
- [x] Created helper scripts for manual actions
- [x] Documented Cloudflare build investigation

### C) Repo health checks pass
- [x] npm install
- [x] npm run build - ✓ Compiled successfully
- [x] npm run lint - ✓ No errors
- [x] npm run audit:docs - ⚠️ Detects doc patterns (expected)

### D) Minimal e2e verification complete
- [x] Secret audit script runs correctly
- [x] Script detects test secrets (validation)
- [x] Script passes with clean files
- [x] Colorized output works
- [x] Exit codes correct (0=pass, 1=fail)

### E) Artifacts updated
- [x] AFTER_ACTION_FINALIZATION.md - Complete implementation guide
- [x] scripts/create-parent-issue.sh - Parent issue creation helper
- [x] scripts/post-parent-status.sh - Status report helper
- [x] Documentation for all manual actions

### F) Link PR(s) and reference parent
- [ ] **Tracks**: #<PARENT_ISSUE_NUMBER>
- [x] Implements findings from external review (Google/Gemini)

### G) Post-implementation note

**Implemented:** Added .gitignore hardening for documentation artifacts, created automated docs secret scanning (script + CI workflow + npm integration), and documented Cloudflare build investigation (finding: no issue, working as designed). All changes are minimal, surgical, and non-breaking.

**Cloudflare finding:** Deploy workflow only runs on main branch. PRs #79-#82 on feature branches correctly do NOT trigger deployments. No action required.

**Rollback:**
```bash
# Revert .gitignore changes
git checkout HEAD~1 -- .gitignore

# Remove secret audit tooling
rm scripts/md_secret_audit.sh
rm .github/workflows/docs-audit.yml

# Remove npm script
# Edit package.json and delete the "audit:docs" line

# Or revert entire commit
git revert <commit-sha>
```
```

---

## Usage Instructions

1. Copy the appropriate section above for each PR
2. Replace `<PARENT_ISSUE_NUMBER>` with the actual parent issue number
3. Paste into the PR description (append to existing description)
4. Check/uncheck items as appropriate
5. Update any specific details if needed

## Common Patterns

**For all PRs:**
- Always verify build/lint passes
- Link to parent issue using `**Tracks**: #X` format
- Include rollback instructions
- Check artifacts were created/updated
- Verify minimal e2e functionality

**For docs-only PRs:**
- Verify documentation is comprehensive
- Check all markdown links work
- Ensure no actual secrets in examples
- Run `npm run audit:docs` if available

**For code changes:**
- Test the actual functionality
- Verify no console errors
- Check build output for route size/type
- Screenshot UI changes if applicable
