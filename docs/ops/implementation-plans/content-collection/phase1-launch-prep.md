---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents, and reviewers
Authority Level: Operational Plan (prepared; not launch authorization)
Owns: Content Collection Phase 1 preparation, child issue graph, Go / NoGo checklist, sequencing, and launch-control boundaries
Does Not Own: Implementation launch, merge authorization, feature-lane release, public publication, AI/OCR/crawler implementation, or issue closure
Canonical Reference: /docs/ops/implementation-plans/content-collection/package-index.md
Related Issues: #2431, #2432, #2433, #2434, #2435, #2436, #2437, #2438, #2359, #2365, #1738
Last Reviewed: 2026-07-10
---

# Content Collection Phase 1 Launch Preparation

## Purpose

Prepare the Content Collection successor work for Phase 1 after Phase 0 documentation promotion completed.

This document does **not** launch implementation. It records the repository-side preparation needed for Bill / ChatGPT Go / NoGo discussion.

## Phase 0 completion baseline

Phase 0 completed the documentation migration, enrichment, Diataxis placement, and terminal promotion inventory for parent #2359.

Primary Phase 0 artifacts on `main`:

- `docs/ops/reports/content-collection-phase0-promotion-closeout-2365.md`
- `docs/ops/reports/content-collection-docs-audit-dedup-2360.md`
- `docs/ops/implementation-plans/content-collection/package-index.md`
- `docs/ops/pmo/content-collection-launch-readiness-checklist.md`
- `docs/ops/pmo/content-collection-parallel-execution-matrix.md`
- `docs/ops/pmo/content-collection-diataxis-promotion-map.md`
- `docs/ops/implementation-plans/content-collection/support/deferred-work-register.md`
- `docs/ops/implementation-plans/content-collection/support/risk-register.md`
- `docs/ops/implementation-plans/content-collection/packages/cc-001-content-asset-model-package.md`
- `docs/ops/implementation-plans/content-collection/packages/cc-002-provenance-rights-contract-package.md`
- `docs/ops/implementation-plans/content-collection/packages/ci-001-pr-body-generator-package.md`
- `docs/ops/implementation-plans/content-collection/packages/ci-002-admin-closeout-auto-repair-package.md`
- `docs/ops/implementation-plans/content-collection/packages/val-001-integrated-program-validation-package.md`

## Current known truth

- Phase 1 preparation parent issue: #2431.
- Prepared child issues: #2432 through #2438.
- All prepared Phase 1 issues are blocked pending #2431 Go / NoGo.
- Cursor is not authorized to begin implementation from these issues until Bill / ChatGPT explicitly approve launch.
- Feature lanes GAL / LIB / MEM / CLUB remain blocked until `CONTRACT-FROZEN: content-asset-model v1` is posted and verified.
- CI-001 and CI-002 implementation must wait for CI Stage 0 current-state gap analysis.
- AI approval, OCR implementation, crawler expansion, and automatic public publication remain deferred.

## Phase 1 objective

Phase 1 should make the Content Collection operating foundation executable without releasing feature lanes prematurely.

Primary outcomes:

1. Reconcile Phase 0 closeout state and stale status references.
2. Freeze the CC-001 content asset model contract.
3. Freeze the CC-002 provenance, rights, privacy, and publication-review contract.
4. Inventory existing CI / PR hygiene / closeout automation before adding new tooling.
5. Implement or prepare CI-001 PR body generator procedural preclearance.
6. Implement or prepare CI-002 administrative closeout auto-repair boundary.
7. Produce Phase 1 validation evidence and downstream release recommendation.

## Child issue graph

| Order | Issue | Title | Package / Lane | Predecessor | Successor | Launch state |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | #2432 | Phase 1 Gate 0 — Readiness Reconciliation and Stale-State Repair | Gate 0 | #2431 Go / NoGo | #2433 | Prepared; blocked |
| 1 | #2433 | CC-001 Content Asset Contract Freeze | CC-001 / P1 | #2432 | #2434 | Prepared; blocked |
| 2 | #2434 | CC-002 Provenance Rights and Publication Contract Freeze | CC-002 / P1 | #2433 | #2435 | Prepared; blocked |
| 3 | #2435 | CI Stage 0 Current-State Gap Analysis | CI Stage 0 / P6 | #2434 | #2436 | Prepared; blocked |
| 4 | #2436 | CI-001 PR Body Generator Preclearance Tooling | CI-001 / P6 | #2435 | #2437 | Prepared; blocked |
| 5 | #2437 | CI-002 Admin Closeout Auto-Repair Boundary | CI-002 / P6 | #2435 and #2436 | #2438 | Prepared; blocked |
| 6 | #2438 | Validation Closeout and Downstream Release Recommendation | VAL-001 | #2433 through #2437 | downstream Go / NoGo | Prepared; blocked |

## Phase 1 sequencing decision

Default sequence is serial until Bill / ChatGPT explicitly authorize parallelism:

1. #2432 first, because stale-state repair protects the rest of the wave.
2. #2433 and #2434 next, because downstream feature lanes depend on contract freeze.
3. #2435 before CI-001 / CI-002, because existing automation must be inventoried before new tooling.
4. #2436 and #2437 may proceed after #2435 only if their allowlists remain disjoint or explicitly serialized.
5. #2438 is terminal and does not itself launch feature lanes.

## Go / NoGo checklist

Before implementation starts:

- [ ] #2431 reviewed by Bill / ChatGPT.
- [ ] This document is merged or explicitly accepted as the Phase 1 prep reference.
- [ ] #2432 through #2438 exist and remain blocked pending launch.
- [ ] Phase 0 terminal status is reconciled in the package index and launch checklist.
- [ ] CC-001 and CC-002 freeze criteria are accepted.
- [ ] CI Stage 0 is accepted as predecessor to CI-001 / CI-002 tooling.
- [ ] Feature lanes remain blocked until freeze marker verification.
- [ ] Review throttle is accepted: maximum two to three `READY FOR REVIEW` PRs.
- [ ] No issue authorizes public publication, AI approval, OCR, crawler expansion, or automatic publication.

## Freeze marker rule

Before P2 / P3 / P4 feature code work begins, ChatGPT must verify a source issue comment containing:

- `CONTRACT-FROZEN: content-asset-model v1`
- source issue number
- package path
- merged PR reference
- fields included
- downstream lanes released or still blocked
- known limitations
- ChatGPT verification outcome

P5 Club Newspaper remains conditional after freeze because it touches the shared Fan Club shell.

## Parallel execution control

| Lane | Phase 1 state | Parallel rule |
| --- | --- | --- |
| P1 — Content Asset Model | Active only after Go / NoGo | Serial by default |
| P2 — Gallery | Blocked | Requires verified freeze marker |
| P3 — Library | Blocked | Requires verified freeze marker |
| P4 — Memorabilia | Blocked | Requires verified freeze marker |
| P5 — Club Newspaper | Conditional blocked | Requires shell-risk review |
| P6 — CI Orchestration | Conditional | Stage 0 before tooling; serialize workflow/script hot zones |

## Stop rules

Stop and request Bill / ChatGPT decision if any task attempts to:

- launch without #2431 Go / NoGo;
- release GAL / LIB / MEM / CLUB feature implementation before contract freeze;
- introduce public publication without human review;
- use AI, OCR, crawler, or automation to approve publication, rights, privacy, credit, or provenance;
- touch rejected documentation roots such as `docs/ops/programs/**` or `docs/reference/website/content-collection/**`;
- bypass PR review, merge authorization, or reviewer disposition.

## Validation

Documentation-only Phase 1 prep validation:

- `bash scripts/ci/docs_check_headers.sh`
- `node scripts/ci/diataxis_folder_audit.mjs`
- `node .agents/checks/agent-governance-check.mjs`

Implementation tasks must add package-specific validation from their source issues and package docs.

## Acceptance criteria

- Phase 1 issue graph is created.
- Repository documentation reflects Phase 0 complete and Phase 1 prepared.
- All Phase 1 issues are blocked pending Go / NoGo.
- Feature-lane release remains blocked until contract freeze evidence is verified.
- CI-001 and CI-002 remain sequenced behind Stage 0.
- Bill / ChatGPT can make Go / NoGo from repo docs and GitHub Issues without relying on chat memory.
