# Sub-Issue #8: Create Unified Onboarding Guide

**Title:** Create unified onboarding guide for new developers

**Labels:** `documentation`, `onboarding`, `ops`

**Parent Issue:** #[PARENT_ISSUE_NUMBER]

## Problem Statement

New developers face information overload when joining the project. Setup information is scattered across multiple files (README, CONTRIBUTING, START_HERE, various docs/\*.md guides). No clear "start here" path.

**Current state:**
- README.md (general info)
- START_HERE.md (Git auth quick fix)
- CONTRIBUTING.md (development guidelines)
- docs/CODESPACES_TOKEN_SETUP.md (Codespaces setup)
- docs/AUTHENTICATION_GUIDE.md (auth reference)
- Multiple other guides

**New developer experience:**
1. Read README - overwhelmed with links
2. Click random guide - too detailed
3. Try to start work - hits auth issues
4. Searches for solution - finds 3 different guides
5. 30-60 minutes before first commit

## Definition of Done

### Acceptance Criteria

1. Single onboarding document created (docs/ONBOARDING.md)
2. Step-by-step guide for first-time setup
3. Clear decision trees (Codespaces vs Local, etc.)
4. Common issues section with quick fixes
5. Links to detailed guides for deep dives
6. Updated README points to onboarding guide
7. Tested with actual new developer (if possible)

### Target Structure

```markdown
# ONBOARDING.md

## Welcome
- Project overview
- What you'll learn
- Estimated time: 10-15 minutes

## Quick Start (Choose Your Path)
### Path A: GitHub Codespaces (Recommended)
- [5 steps, 5 minutes]
### Path B: Local Development
- [7 steps, 10 minutes]

## Your First Contribution
- Make a change
- Test it
- Submit PR

## Common Issues & Quick Fixes
- [Top 5 issues with solutions]

## Deep Dive (Optional)
- Links to detailed guides
- Architecture overview
- Testing guide
```

## Risks & Assumptions

**Risks:**
- Guide becomes outdated quickly
- Too prescriptive (doesn't fit all setups)
- Still too long/complex

**Assumptions:**
- Most new devs use Codespaces or modern local setup
- First contribution is documentation or small fix
- Onboarding <15 minutes acceptable

**Mitigations:**
- Keep high-level, link to details
- Regular reviews (quarterly)
- Gather feedback from actual new devs
- Version date on document

## Deliverables Checklist

- [ ] Create docs/ONBOARDING.md skeleton
- [ ] Write Codespaces quick start path
- [ ] Write local development quick start path
- [ ] Add "Your First Contribution" section
- [ ] Document top 5 common issues + fixes
- [ ] Add links to detailed guides
- [ ] Update README.md with prominent link
- [ ] Update CONTRIBUTING.md to reference onboarding
- [ ] Get feedback (internal or external)
- [ ] Iterate based on feedback

## A→G Acceptance Loop

### A) Preconditions Verified
- [ ] All referenced guides exist and are current
- [ ] Access to sample "new developer" for testing
- [ ] Understanding of common pain points
- [ ] Clear idea of target audience

### B) Implementation Steps Executed
- [ ] Created ONBOARDING.md structure
- [ ] Wrote Codespaces quick start
- [ ] Wrote local quick start
- [ ] Added troubleshooting section
- [ ] Updated cross-references
- [ ] Tested flow with volunteer

### C) Repo Health Checks Pass
- [ ] `npm run lint` - No errors
- [ ] `npm run build` - Successful
- [ ] All links in ONBOARDING.md valid
- [ ] No broken cross-references

### D) Minimal E2E Verification
**Exact commands:**
```bash
# Verify file created
ls -la docs/ONBOARDING.md

# Check for broken links
npx markdown-link-check docs/ONBOARDING.md
npx markdown-link-check README.md

# Verify readability
wc -w docs/ONBOARDING.md  # Target: <2000 words
```

**Manual verification:**
- [ ] Read through as "new developer"
- [ ] Follow Codespaces path - complete in <10 min?
- [ ] Follow local path - complete in <15 min?
- [ ] Common issues section addresses real problems
- [ ] Links to detailed guides work
- [ ] Writing is clear and welcoming

### E) Artifacts Updated
- [ ] docs/ONBOARDING.md (created - primary deliverable)
- [ ] README.md (add prominent link to onboarding)
- [ ] CONTRIBUTING.md (reference onboarding)
- [ ] CHANGELOG.md: "docs: create unified onboarding guide"

### F) Link PR(s) and Reference Parent
- [ ] PR: "docs: create unified onboarding guide"
- [ ] Closes #[THIS_ISSUE], part of #[PARENT_ISSUE]
- [ ] Labels: `documentation`, `onboarding`

### G) Close with Post-Implementation Note
```markdown
## ✅ Completed

**Onboarding guide created:**
- Location: docs/ONBOARDING.md
- Two paths: Codespaces (5 steps) + Local (7 steps)
- Common issues section with top 5 problems
- Links to detailed guides for deep dives

**Target time:**
- Codespaces: 5-10 minutes to first contribution
- Local: 10-15 minutes to first contribution

**Feedback:**
[If tested with actual new dev, include their feedback]

**Rollback:** Remove docs/ONBOARDING.md, revert README/CONTRIBUTING links
```

---

**Estimated effort:** 3-4 hours (including testing)  
**Complexity:** Medium (requires synthesis of multiple sources)
