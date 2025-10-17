# Sub-Issue #1: Consolidate Duplicate Documentation

**Title:** Consolidate duplicate authentication documentation into clear hierarchy

**Labels:** `docs`, `cleanup`, `ops`

**Parent Issue:** #[PARENT_ISSUE_NUMBER]

## Problem Statement

Multiple authentication guides were created during troubleshooting sessions, resulting in overlapping and potentially contradictory documentation. New users face decision paralysis when choosing which guide to follow.

**Current state:**
- START_HERE.md (85 lines) - Immediate fix for browser tab issues
- docs/TERMINAL_ONLY_AUTH.md (167 lines) - Complete terminal auth guide
- docs/QUICK_FIX.md - Quick reference
- docs/GIT_AUTH_TROUBLESHOOTING.md - Comprehensive troubleshooting
- docs/CODESPACES_TOKEN_SETUP.md (150+ lines) - Codespaces-specific setup

**Issues:**
- Content duplication across 5+ files
- Unclear hierarchy (which to read first?)
- Maintenance burden (update in multiple places)
- User confusion

## Definition of Done

### Acceptance Criteria

1. Single clear documentation hierarchy established
2. START_HERE.md remains as quick-start entry point
3. One comprehensive reference guide created
4. All duplicate content removed or consolidated
5. Cross-references updated throughout repository
6. README.md points to new structure
7. Old files archived or removed

### Documentation Structure (Proposed)

```
Root:
- START_HERE.md (unchanged - quick fix entry point)
- README.md (updated links)

docs/:
- AUTHENTICATION_GUIDE.md (NEW - comprehensive reference)
  ├─ Codespaces Setup
  ├─ Local Development
  ├─ Terminal-Only Method
  └─ Troubleshooting

docs/archive/:
- TERMINAL_ONLY_AUTH.md (archived)
- QUICK_FIX.md (archived)
- GIT_AUTH_TROUBLESHOOTING.md (consolidated)
```

## Risks & Assumptions

**Risks:**
- Breaking existing bookmarks/links to old docs
- User confusion during transition
- Missing edge cases during consolidation

**Assumptions:**
- Users primarily arrive via README or CONTRIBUTING
- START_HERE.md should remain as emergency fix guide
- Most common path: README → AUTHENTICATION_GUIDE

**Mitigations:**
- Keep START_HERE.md unchanged (stable entry point)
- Add redirects/notices in archived files
- Test all cross-references before closing

## Deliverables Checklist

- [ ] Create docs/AUTHENTICATION_GUIDE.md (comprehensive)
- [ ] Consolidate content from 5 source files
- [ ] Update README.md links
- [ ] Update CONTRIBUTING.md references
- [ ] Add navigation/cross-references
- [ ] Archive duplicate files to docs/archive/
- [ ] Add notices in archived files pointing to new location
- [ ] Update all cross-references in other docs
- [ ] Test all links
- [ ] Update .github/ISSUE_TEMPLATE if it references old docs

## A→G Acceptance Loop

### A) Preconditions Verified
- [ ] All source documentation files exist and are readable
- [ ] Documentation audit complete (list of all references)
- [ ] Backup of current docs created
- [ ] Write access to repository confirmed

### B) Implementation Steps Executed
- [ ] Created new AUTHENTICATION_GUIDE.md
- [ ] Consolidated content (removed duplicates)
- [ ] Updated all cross-references
- [ ] Archived old files with redirect notices
- [ ] Updated root-level documentation

### C) Repo Health Checks Pass
- [ ] `npm run lint` - No errors
- [ ] `npm run build` - Successful build
- [ ] `npx tsc --noEmit` - Type checking passed
- [ ] No broken links (run link checker)

### D) Minimal E2E Verification
**Exact commands/URLs:**
```bash
# Verify documentation structure
ls -la docs/AUTHENTICATION_GUIDE.md
ls -la docs/archive/

# Check for broken markdown links
npx markdown-link-check README.md
npx markdown-link-check docs/AUTHENTICATION_GUIDE.md
npx markdown-link-check CONTRIBUTING.md

# Verify START_HERE.md unchanged
git diff START_HERE.md  # Should show no changes
```

**Manual verification:**
- [ ] Read through new AUTHENTICATION_GUIDE.md (flows logically)
- [ ] Follow links from README → AUTHENTICATION_GUIDE
- [ ] Check archived files have redirect notices
- [ ] Verify CONTRIBUTING.md points to correct guide

### E) Artifacts Updated
- [ ] README.md (updated links)
- [ ] CONTRIBUTING.md (updated references)
- [ ] docs/AUTHENTICATION_GUIDE.md (created)
- [ ] docs/archive/*.md (archived with notices)
- [ ] CHANGELOG.md entry: "docs: consolidate authentication guides"

### F) Link PR(s) and Reference Parent
- [ ] PR created with title: "docs: consolidate authentication documentation"
- [ ] PR description references this issue: "Closes #[THIS_ISSUE]"
- [ ] PR description references parent: "Part of #[PARENT_ISSUE]"
- [ ] Labels: `docs`, `cleanup`

### G) Close with Post-Implementation Note

**Template:**
```markdown
## ✅ Completed

**What changed:**
- Consolidated 5 authentication guides into single AUTHENTICATION_GUIDE.md
- Archived duplicate files to docs/archive/
- Updated all cross-references (README, CONTRIBUTING, etc.)

**How to use:**
- Quick fix: START_HERE.md (unchanged)
- Full guide: docs/AUTHENTICATION_GUIDE.md (NEW)
- Archives: docs/archive/ (for reference)

**Rollback:**
If issues arise, restore from docs/archive/:
```bash
git mv docs/archive/TERMINAL_ONLY_AUTH.md docs/
git mv docs/archive/QUICK_FIX.md docs/
git restore README.md CONTRIBUTING.md  # from previous commit
```

**Verification:**
All doc links tested with `markdown-link-check` - no broken links.
```

---

**Estimated effort:** 2-3 hours  
**Complexity:** Medium (mostly copy/paste and reorganization)
