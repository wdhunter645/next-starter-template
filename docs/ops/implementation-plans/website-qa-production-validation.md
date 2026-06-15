---
Doc Type: Implementation Plan
Audience: Atlas, Bill, LGFC maintainers, implementation agents, and reviewers
Authority Level: Operational Plan
Owns: Future build issue sequence and verification plan for Website QA / Production Validation after documentation approval
Does Not Own: Runtime implementation before child issues, unauthorized GitHub issue mutation, workflow YAML unless explicitly scoped, or final launch authorization
Status: phase-3-planning
Project: website-qa-production-validation
Owner: Atlas
Execution Mode: orchestrated-after-approval
Source Issue: 1259
Related Program Issue: 1255
Canonical Reference: /docs/ops/implementation-plans/README.md
Related Issues: #1255, #1256, #1258, #1259, #1053, #1112, #943, #946, #947, #1013, #1014, #1015, #1016, #1017, #1108, #1109, #1110, #1111, #1500
Last Reviewed: 2026-06-15
---

# Website QA and Production Validation Implementation Plan

## Status

Phase 3 planning for `#1259` is **in progress**. Predecessor `#1258` (Website
Operations Admin) is **complete** on `main` (Phase 4 Tasks 001–013; terminal PR
`#1652`). Phase 4 QA execution is **not authorized** until Atlas/Bill approve
this plan.

Plan status: `phase-3-planning` (not `production-ready`). Child issue creation
remains held unless explicitly authorized.

## Source of truth

| Field | Value |
| --- | --- |
| Parent program | `#1255` — Website Implementation and Content Operations |
| Source issue | `#1259` — Website QA and Production Validation |
| Predecessor project | `#1258` — Website Operations Admin (**closed complete**) |
| Out of scope | `#1500` — CI Post-Merge Closeout Reliability (**queued**) |
| Legacy coordination tree | `#1053` — historical T-task index only |
| Phase 0 reconciliation | `docs/ops/reports/program-2-website-phase0-reconciliation.md` |
| Legacy QA issue table | `docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md` |
| Ops admin handoff | `docs/how-to/website/admin-operations-overview.md` |
| Content inventory authority | `#1256` / `docs/reference/website/content-inventory-model.md` |

## Scope

**Website QA / Production Validation** means verifying public production readiness
and reconciling stale public-core website issues — not rebuilding satisfied lanes.

In scope:

- **Public route catalog** — canonical routes resolve; no dead links in header/footer/nav
- **Navigation invariants** — header, footer, mobile nav, auth-aware variants
- **Auth-state behavior** — guest, member, admin fail-closed paths
- **Mobile/responsive checks** — critical public surfaces at defined breakpoints
- **D1/B2 read-path verification** — public APIs and media URLs fail closed safely
- **Content inventory public render** — `#1256` published content appears on allowed surfaces only
- **Launch-readiness gap** — H-011 scheduled e2e / production validation CI (document or scoped fix)
- **Public-core legacy disposition** — `#1112`, `#943`–`#947`, `#1013`–`#1017`, `#1108`–`#1111`
- **Final QA report** — operations handoff artifact under `docs/ops/reports/**`

Out of scope:

- New admin feature builds (`#1258` complete)
- Content strategy redesign (`#1256` complete)
- CI reliability program (`#1500`)
- Unauthorized bulk GitHub issue closure
- Broad homepage redesign unless a validation blocker contradicts design authority

## Current known truth

Assessment date: **2026-06-15** (`main` after `#1258` terminal merge `#1652`).

### Predecessor completion evidence

| Project | Terminal PR | Notes |
| --- | --- | --- |
| `#1256` Content Strategy | `#1520` area / `#1407` | Editorial inventory and public population complete |
| `#1258` Ops Admin | `#1652` | Operator runbooks + legacy disposition package published |

### T50 / launch-readiness caveat (H-011)

PR `#1221` merged launch-readiness work under legacy `#1112`, but **scheduled
launch-readiness e2e is not wired in CI** per Program 1 operational health review
(H-011). `#1259` must treat T50 as **partially satisfied** — validation evidence
exists; CI scheduling gap remains.

### Deferred items from `#1258` runbooks

Operator runbooks explicitly defer to `#1259`:

- Fan Club PDF/upload pipeline edge cases
- Full public calendar production validation after events admin changes
- Editorial public-surface QA beyond inventory field correctness
- Production deploy preview confidence (Cloudflare Pages)

## Intended final state

Before `#1255` program closeout may proceed:

1. Public routes, navigation, and auth states are validated against design authority.
2. D1/B2 public read paths are verified with documented fail-closed behavior.
3. Published `content_inventory` records render only on allowed surfaces.
4. H-011 launch-readiness CI gap is closed, explicitly deferred with owner sign-off, or bounded to `#1500`.
5. Legacy public-core issues (`#1112`, T21–T34 list) have documented dispositions.
6. Final QA report exists for operations handoff.

## Legacy issue reconciliation summary

Full table: `docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md`.

| Issue | Disposition |
| --- | --- |
| `#1112` T50 | **Partially satisfied** — PR `#1221` merged; H-011 CI scheduling gap remains |
| `#943`–`#947`, `#1013`–`#1017`, `#1108`–`#1111` | **Satisfied on main** — disposition/closeout batch deferred to Task 008 |
| `#1053` | **Subordinated** — historical index; `#1255` child projects are planning authority |

## Proposed child task sequence

**Issue titles only.** Phase 4 tasks execute as scoped PRs under `#1259`; child
issues are not auto-created without explicit authorization.

Operating rule: **inventory before delta.** Task 001 must complete before area
validation tasks claim gaps.

### Task 001 — Public QA As-Built Inventory and Gap Analysis

| Field | Value |
| --- | --- |
| **Title** | Task 001 — Public QA as-built inventory and gap analysis |
| **Objective** | Catalog public routes, auth surfaces, and test coverage; classify gaps vs design authority. |
| **Allowed files/areas** | `docs/ops/reports/**`, `docs/reference/website/**`, `docs/reference/design/**`; read-only inspection of `src/app/**`, `functions/api/**`, `tests/**` |
| **Non-goals** | Runtime changes; issue closure |
| **Acceptance criteria** | Gap table published; H-011 status recorded; `#1112` and T21–T34 lanes mapped |
| **Verification** | `./scripts/ci/docs_check_headers.sh` on changed docs |
| **Dependencies** | `#1258` closed complete |

### Task 002 — Public Route and Navigation Validation Pack

| Field | Value |
| --- | --- |
| **Title** | Task 002 — Public route and navigation validation |
| **Objective** | Verify canonical public routes and header/footer/mobile nav invariants. |
| **Allowed files/areas** | `tests/**` (route/nav scoped), `src/components/**` (nav only if gap found), `docs/ops/reports/**` |
| **Non-goals** | Admin route changes; homepage redesign |
| **Acceptance criteria** | Route/nav checklist passes or gaps documented with severity |
| **Verification** | `npm test` for touched tests; manual route checklist |
| **Dependencies** | Task 001 |

### Task 003 — Auth-State Validation Pack

| Field | Value |
| --- | --- |
| **Title** | Task 003 — Auth-state validation (guest/member/admin) |
| **Objective** | Verify session gates on `/fanclub/**`, `/admin/**`, and auth-aware header behavior. |
| **Allowed files/areas** | `tests/**`, `src/app/fanclub/**`, `src/app/admin/layout.tsx`, `docs/ops/reports/**` |
| **Non-goals** | Auth provider redesign |
| **Acceptance criteria** | Guest/member/admin matrix documented; fail-closed paths verified |
| **Verification** | Targeted vitest; manual auth checklist |
| **Dependencies** | Task 001 |

### Task 004 — Mobile and Responsive Validation Pack

| Field | Value |
| --- | --- |
| **Title** | Task 004 — Mobile and responsive validation |
| **Objective** | Validate critical public surfaces at mobile/tablet/desktop breakpoints. |
| **Allowed files/areas** | `tests/**` (playwright if present), `docs/ops/reports/**`, scoped CSS only if gap found |
| **Non-goals** | Visual redesign |
| **Acceptance criteria** | Responsive checklist for priority routes complete |
| **Verification** | Manual viewport checklist; playwright if in scope |
| **Dependencies** | Task 002 |

### Task 005 — D1 and B2 Public Read-Path Verification

| Field | Value |
| --- | --- |
| **Title** | Task 005 — D1 and B2 public read-path verification |
| **Objective** | Verify public APIs and media URLs fail closed; no silent empty-state regressions. |
| **Allowed files/areas** | `functions/api/**` (read paths only), `tests/**`, `docs/ops/reports/**` |
| **Non-goals** | Schema migrations; admin write paths |
| **Acceptance criteria** | D1/B2 checklist documented; critical read APIs verified |
| **Verification** | `npm test`; manual API smoke |
| **Dependencies** | Task 001 |

### Task 006 — Content Inventory Public Surface Validation

| Field | Value |
| --- | --- |
| **Title** | Task 006 — Content inventory public surface validation |
| **Objective** | Confirm `#1256` published inventory renders only on `allowed_sections` surfaces. |
| **Allowed files/areas** | `src/app/**` (public surfaces), `tests/content-inventory*.test.ts`, `docs/ops/reports/**` |
| **Non-goals** | Editorial strategy changes |
| **Acceptance criteria** | Spot-check published records on homepage, library, milestones, search as applicable |
| **Verification** | Content-inventory tests; manual surface checklist |
| **Dependencies** | Task 001; `#1256` complete |

### Task 007 — Launch-Readiness and Scheduled E2E Gap (H-011)

| Field | Value |
| --- | --- |
| **Title** | Task 007 — Launch-readiness / scheduled e2e gap (H-011) |
| **Objective** | Close, document, or bound the launch-readiness CI scheduling gap from `#1112` / H-011. |
| **Allowed files/areas** | `.github/workflows/**` only if explicitly authorized; `tests/**`; `docs/ops/reports/**` |
| **Non-goals** | Full `#1500` CI program |
| **Acceptance criteria** | H-011 disposition recorded; scheduled e2e path defined or deferred with owner sign-off |
| **Verification** | Workflow inspection; e2e run evidence if wired |
| **Dependencies** | Task 001 |

### Task 008 — Public-Core Legacy Disposition Documentation

| Field | Value |
| --- | --- |
| **Title** | Task 008 — Public-core legacy disposition documentation |
| **Objective** | Publish recommended disposition comments for `#1112` and T21–T34 public issues (no bulk close unless authorized). |
| **Allowed files/areas** | `docs/ops/reports/**`, `docs/how-to/website/**` (QA runbooks if needed) |
| **Non-goals** | Unauthorized GitHub issue mutation |
| **Acceptance criteria** | Disposition package ready for Atlas batch review |
| **Verification** | `./scripts/ci/docs_check_headers.sh` |
| **Dependencies** | Task 001 |

### Task 009 — Final QA Report and Operations Handoff

| Field | Value |
| --- | --- |
| **Title** | Task 009 — Final QA report and operations handoff |
| **Objective** | Consolidate validation evidence into final QA report for `#1255` program closeout. |
| **Allowed files/areas** | `docs/ops/reports/**`, `docs/how-to/website/**`, PMO trackers if authorized |
| **Non-goals** | Application code unless gap-only fix authorized |
| **Acceptance criteria** | Final QA report published; open blockers classified; handoff status explicit |
| **Verification** | Docs header check; program handoff checklist |
| **Dependencies** | Tasks 002–008 complete or accepted gap-only |

## Dependency map

| Task | Predecessor | Successor | Stage-before-merge | Halt condition | Resume condition |
| --- | --- | --- | --- | --- | --- |
| 001 | `#1258` closeout verified | 002 | yes | `#1258` not complete | `#1258` merged and closed |
| 002 | 001 | 003 | yes | Task 001 gap table missing | Task 001 merged |
| 003 | 002 | 004 | yes | Route/nav blockers unresolved | Task 002 merged or gaps accepted |
| 004 | 003 | 005 | yes | Auth blockers unresolved | Task 003 merged or gaps accepted |
| 005 | 004 | 006 | yes | Responsive blockers unresolved | Task 004 merged or gaps accepted |
| 006 | 005 | 007 | yes | D1/B2 blockers unresolved | Task 005 merged or gaps accepted |
| 007 | 006 | 008 | yes | Content render blockers unresolved | Task 006 merged or gaps accepted |
| 008 | 007 | 009 | yes | H-011 unbounded | Task 007 merged or deferred with sign-off |
| 009 | 008 | terminal | yes | Disposition package incomplete | Task 008 merged |

## Phase 3 exit criteria

| Criterion | State |
| --- | --- |
| Implementation plan approved for Phase 4 task execution | Pending — this planning PR |
| Proposed child task sequence (Tasks 001–009) | Met in this plan |
| Per-task file allowlists | Met in this plan |
| Legacy `#1112` / T21–T34 disposition documented | Met in reconciliation report |
| `#1258` predecessor complete | Met — PR `#1652` merged |
| H-011 explicitly addressed in plan | Met — Task 007 |
| `#1500` queued / out of scope | Met — not started |

**Authorization model:** Phase 4 tasks require explicit per-task authorization.
Do not infer open-ended implementation from `phase-3-planning` alone.

## Risk register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Treating merged T50 as fully closed | False launch confidence | Task 007 / H-011 explicit disposition |
| Bulk-closing stale public issues | Lost audit trail | Task 008 disposition package only |
| Mixing QA fixes with new features | Scope creep | Gap-only rule; one intent per PR |
| Playwright/e2e env instability | Flaky launch gates | Document env requirements in Task 007 |
| Content inventory regression | Wrong public content | Task 006 aligned with `#1256` model |
| Cloudflare preview vs production drift | False QA pass | Record environment in QA report |

## Verification plan

### This planning PR (docs only)

```bash
git status --short
git diff --check
./scripts/ci/docs_check_headers.sh \
  docs/ops/implementation-plans/website-qa-production-validation.md \
  docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md
```

### Future implementation PRs (representative)

```bash
npm run typecheck
npm test
npx vitest run <scoped-tests>
./scripts/ci/docs_check_headers.sh <changed-docs>
```

Manual production smoke checklist per task (documented in child issue bodies).

## Approval and issue creation hold

Plan status is `phase-3-planning` (not `production-ready`).

Phase 3 planning exit is **pending** merge of this planning PR. Child GitHub issues
remain held unless Atlas/Bill or existing automation explicitly authorizes creation.
