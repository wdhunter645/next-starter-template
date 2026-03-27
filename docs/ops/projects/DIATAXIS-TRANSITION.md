---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: DIÁTAXIS transition scope, target structure, worklist, pre/post PR operating model
Does Not Own: Canonical design authority; implementation specs; folder intent rules
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-03-27
---

# LGFC — DIÁTAXIS TRANSITION & GOVERNANCE MODEL

## 1. Purpose

This project exists to stop documentation-driven implementation regressions by introducing a strict DIÁTAXIS overlay, enforcing folder purpose, and validating merged-state outcomes after DIÁTAXIS PRs land.

This is a transition project, not a cosmetic documentation cleanup.

## 2. Final Target Structure

```text
docs/
├── tutorials/
│   ├── getting-started.md
│   ├── build-homepage.md
│   ├── implement-auth.md
│   └── deploy-to-cloudflare.md
├── how-to/
│   ├── create-pr.md
│   ├── update-navigation.md
│   ├── add-new-page.md
│   ├── fix-auth-issue.md
│   └── update-database-schema.md
├── reference/
│   ├── auth-model.md
│   ├── access-control.md
│   ├── data-model.md
│   ├── api-contracts.md
│   ├── routes.md
│   ├── search.md
│   ├── faq-system.md
│   ├── static-pages.md
│   └── component-specs/
│       ├── header.md
│       ├── footer.md
│       └── homepage-sections.md
├── explanation/
│   ├── architecture-overview.md
│   ├── auth-decision.md
│   ├── design-principles.md
│   └── governance-model.md
├── governance/
├── ops/
└── archive/
```

## 3. Folder Definitions

- `tutorials/` = step-by-step learning from zero to working outcome.
- `how-to/` = one task, one objective, one execution path.
- `reference/` = facts only; single source of truth for system definitions.
- `explanation/` = why decisions exist; rationale and tradeoffs only.
- `governance/` = rules, standards, invariants, change-control, enforcement.
- `ops/` = projects, trackers, execution plans, remediation tracking.
- `archive/` = deprecated and legacy material only.

Folder purpose is strict. Drift is not allowed.

## 4. Pre-PR Model

DIÁTAXIS PRs must:

- use a tightly scoped file allowlist
- remain docs-only unless explicitly approved otherwise
- carry the `DIATAXIS` label
- pass normal pre-merge gates
- reference the exact project/work item being implemented

## 5. Post-Merge Validation Model

A dedicated post-merge validation workflow will run only for PRs labeled `DIATAXIS`.

The workflow will validate:

1. folder-intent compliance
2. doc-type compliance
3. duplicate authority definitions
4. contradiction detection across merged-state docs
5. canonical linking where applicable

This workflow validates merged reality, not just PR intent.

## 6. Auto-Fix Loop

The DIÁTAXIS post-merge model uses a bounded repair loop:

- Attempt 1 = original merged PR fails post-merge validation
- Attempt 2 = auto-fix PR #1
- Attempt 3 = auto-fix PR #2
- After 3 total failures = stop automation and escalate

Labels:

- `DIATAXIS`
- `DIATAXIS-AUTOFIX`
- `DIATAXIS-ESCALATE`

## 7. Resource Allocation

- Cursor = DIÁTAXIS transition document creation and structure overlay
- Copilot = DIÁTAXIS validation and automation workflows
- Codex = website implementation
- Codex = fundraiser build and homepage publishing support after website work

## 8. Worklist

### Phase 1 — Foundation
1. Add transition plan document
2. Add folder authority document
3. Create DIÁTAXIS labels

### Phase 2 — Workflow Enablement
4. Add post-merge validation workflow skeleton
5. Add folder-authority validator skeleton
6. Add bounded auto-fix / escalation skeleton
7. Test workflows using small DIÁTAXIS PRs

### Phase 3 — Structure Creation
8. Create `tutorials/`, `how-to/`, and `explanation/`
9. Add file templates under expected filenames

### Phase 4 — Reference Baseline
10. Author `reference/auth-model.md`
11. Author `reference/access-control.md`
12. Author `reference/routes.md`
13. Author `reference/data-model.md`
14. Author `reference/api-contracts.md`
15. Author `reference/component-specs/header.md`
16. Author `reference/component-specs/footer.md`
17. Author `reference/component-specs/homepage-sections.md`

### Phase 5 — Explanation Layer
18. Author `explanation/architecture-overview.md`
19. Author `explanation/auth-decision.md`
20. Author `explanation/design-principles.md`
21. Author `explanation/governance-model.md`

### Phase 6 — How-To Layer
22. Author `how-to/create-pr.md`
23. Author `how-to/update-navigation.md`
24. Author `how-to/add-new-page.md`
25. Author `how-to/fix-auth-issue.md`
26. Author `how-to/update-database-schema.md`

### Phase 7 — Tutorials
27. Author `tutorials/getting-started.md`
28. Author `tutorials/build-homepage.md`
29. Author `tutorials/implement-auth.md`
30. Author `tutorials/deploy-to-cloudflare.md`

## 9. Transition Rules

- New DIÁTAXIS docs are created net-new.
- Legacy docs remain available during transition.
- Legacy docs are not automatically authoritative just because they are older.
- Governance and ops stay in place during overlay.
- The transition itself must be fully documented.

## 10. Success Criteria

The transition is successful when:

- documentation-driven regressions materially decrease
- DIÁTAXIS docs become the primary execution surface
- merged-state validation catches contradictions quickly
- folder purpose remains stable over time
