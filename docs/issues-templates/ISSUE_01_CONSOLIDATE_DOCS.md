# Consolidate Documentation Architecture

**Labels:** `docs`, `cleanup`, `high-priority`  
**Parent Issue:** #{PARENT_ISSUE_NUMBER}

---

## Problem Statement

The repository currently has 15+ documentation files with overlapping and redundant content, creating confusion for developers and increasing maintenance burden.

### Current State

**Auth/Codespaces Documentation (Highly Overlapping):**
- START_HERE.md
- docs/TERMINAL_ONLY_AUTH.md
- docs/CODESPACES_TOKEN_SETUP.md
- docs/CODESPACES_LOGOUT.md
- docs/QUICK_FIX.md
- docs/GIT_AUTH_TROUBLESHOOTING.md
- docs/CODESPACES_CRASH_RECOVERY.md
- fix-git-auth.sh

**Service-Specific Documentation:**
- docs/CLOUDFLARE_ANALYTICS.md
- docs/ELFSIGHT_SETUP.md

**General Documentation:**
- README.md
- CONTRIBUTING.md
- SECRETS_SETUP.md

**After-Action Reports (should be archived separately - see Issue #N):**
- 7 *_COMPLETE.md files

### Problems

1. **Developer confusion** - Where to start? Multiple "quick fix" guides
2. **Maintenance burden** - Updates must be propagated to 5+ files
3. **Inconsistency risk** - Information contradicts between files
4. **Poor discoverability** - Important info scattered across many files

---

## Definition of Done

- [ ] Single authoritative getting-started guide in README.md
- [ ] Single comprehensive troubleshooting guide (docs/TROUBLESHOOTING.md)
- [ ] Clear navigation between docs (no circular references)
- [ ] All auth/Codespaces info consolidated into 2-3 focused docs max
- [ ] Outdated/redundant content removed
- [ ] Cross-references updated throughout
- [ ] All links tested and working

---

## Proposed Solution

### New Documentation Structure

```
/
├── README.md (Enhanced with clear "Getting Started" section)
├── CONTRIBUTING.md (Links to specific troubleshooting sections)
├── SECRETS_SETUP.md (Unchanged - focused on env vars)
│
└── docs/
    ├── TROUBLESHOOTING.md (NEW - Consolidated troubleshooting)
    │   ├── Quick Fixes
    │   ├── Codespaces Authentication  
    │   ├── Git Push Issues
    │   ├── Crash Recovery
    │   └── Common Errors
    │
    ├── CODESPACES_SETUP.md (Consolidated from 5 files)
    │   ├── Prerequisites
    │   ├── Token Configuration
    │   ├── Common Issues
    │   └── Advanced Topics
    │
    ├── CLOUDFLARE_ANALYTICS.md (Unchanged)
    ├── ELFSIGHT_SETUP.md (Unchanged)
    ├── SECURITY_NOTICE.md (Unchanged)
    ├── ARCHITECTURE.md (Unchanged)
    └── CONFIGURATION_REFERENCE.md (Unchanged)
```

### Files to Consolidate

**Merge into docs/CODESPACES_SETUP.md:**
- START_HERE.md → Quick Start section
- docs/TERMINAL_ONLY_AUTH.md → Authentication Methods section
- docs/CODESPACES_TOKEN_SETUP.md → Token Configuration section
- docs/CODESPACES_LOGOUT.md → Troubleshooting section

**Merge into docs/TROUBLESHOOTING.md:**
- docs/QUICK_FIX.md → Quick Fixes section
- docs/GIT_AUTH_TROUBLESHOOTING.md → Git Issues section
- docs/CODESPACES_CRASH_RECOVERY.md → Recovery section
- Relevant sections from CONTRIBUTING.md

**Keep fix-git-auth.sh** but reference from consolidated docs

---

## Risks & Assumptions

### Risks

1. **Breaking existing links** - External references may point to old file names
   - Mitigation: Add redirects in README or create stub files with links
2. **Content loss** - Important details might be missed during merge
   - Mitigation: Careful review, diff old vs new
3. **User disruption** - Current users following old guides
   - Mitigation: Announce changes, keep redirects for 1 month

### Assumptions

1. Most users start from README.md
2. Consolidated docs will be easier to maintain
3. Existing links are primarily internal (within repo)

---

## Checklist of Deliverables

- [ ] Create docs/CODESPACES_SETUP.md (consolidate 4 auth files)
- [ ] Create docs/TROUBLESHOOTING.md (consolidate 3 troubleshooting files)
- [ ] Update README.md with clear Getting Started section
- [ ] Update CONTRIBUTING.md to reference new doc structure
- [ ] Add redirects/stubs for removed files (if needed)
- [ ] Update all cross-references in remaining files
- [ ] Test all documentation links
- [ ] Add navigation index at docs/README.md
- [ ] Document the new structure in CONTRIBUTING.md

---

## A→G Acceptance Criteria

### A) Preconditions verified
- [ ] All existing docs reviewed and content catalogued
- [ ] Dependency: After-action reports archived (Issue #N)
- [ ] No open PRs touching documentation files
- [ ] Current doc structure documented (screenshot/tree)

### B) Implementation steps executed
- [ ] New consolidated files created
- [ ] Content migrated from old files
- [ ] Cross-references updated
- [ ] Old files removed or redirected
- [ ] Navigation added

### C) Repo health checks pass
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds  
- [ ] Type checking passes
- [ ] No broken markdown links (use markdown-link-check if available)

### D) Minimal e2e verification complete
- [ ] Manual walkthrough of each new doc
- [ ] All internal links clicked and verified
- [ ] Quick start guide tested by following steps
- [ ] Troubleshooting scenarios validated
- [ ] Commands listed actually work

### E) Artifacts updated
- [ ] README.md updated with new structure
- [ ] CONTRIBUTING.md references new locations
- [ ] docs/README.md created with navigation index
- [ ] CHANGELOG.md updated (if it exists)

### F) Link PR(s) and reference parent
- [ ] PR opened with "Closes #{this_issue_number}"
- [ ] PR references parent issue #{PARENT_ISSUE_NUMBER}
- [ ] PR description includes:
  - Before/after doc structure
  - List of removed files
  - List of new files
  - Migration notes

### G) Close with post-implementation note
**What changed:**
- Consolidated 8 overlapping docs into 2 focused guides
- Created clear navigation structure
- Removed X redundant files

**How to verify:**
- Read docs/CODESPACES_SETUP.md - complete auth walkthrough
- Read docs/TROUBLESHOOTING.md - all common issues covered
- Follow quick start in README.md - works end-to-end

**Rollback process:**
- Revert PR commit
- Old files still in git history if needed
- No data loss - just reorganization

---

## Implementation Notes

### Content Migration Strategy

1. **Extract unique content** from each file
2. **Identify duplicates** and keep best version
3. **Organize hierarchically** (overview → details → troubleshooting)
4. **Add clear headings** and table of contents
5. **Cross-reference** related sections

### Testing Approach

1. **Link validation** - Use markdown-link-check or manual
2. **Content coverage** - Ensure no topics dropped
3. **User flows** - Walk through common scenarios
4. **Search terms** - Ensure key terms still findable

---

**Estimated Effort:** 4-6 hours  
**Priority:** High  
**Dependency:** Should follow Issue #N (Archive After-Action Reports)
