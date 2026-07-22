---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents, and reviewers
Authority Level: Operational Plan (launched under #2431 GO; does not authorize feature lanes or Production)
Owns: Content Collection Phase 1 preparation record, child issue graph, Go / NoGo checklist evidence, sequencing, and launch-control boundaries
Does Not Own: Feature-lane release, public publication, AI/OCR/crawler implementation, merge authorization, Production promotion, or issue closure
Canonical Reference: /docs/ops/implementation-plans/content-collection/package-index.md
Related Issues: #2431, #2432, #2433, #2434, #2435, #2436, #2437, #2438, #2359, #2365, #1738
Last Reviewed: 2026-07-21
---

# Content Collection Phase 1 Launch Preparation

## Purpose

Record the Content Collection Phase 1 preparation baseline and the post-launch execution controls after Phase 0 documentation promotion completed and #2431 received project-level GO.

This document does **not** authorize GAL / LIB / MEM / CLUB feature implementation, public publication, or Production / `main` promotion. It records sequencing and boundaries for the launched child graph on `component/content-collection-phase1`.

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

Phase 0 terminal evidence: PR #2427 merged 2026-07-10 (`0709343a40375ed89f577f3b1feb34c9e345a2a3`); #2365 and #2359 closed.

## Current known truth

- Phase 1 parent issue: #2431 — **launched** (Bill Product Authority GO 2026-07-20, comment `5021338828`); project close pending #2438 acceptance.
- Children #2432–#2437 are **CLOSED complete** on `component/content-collection-phase1`.
- Terminal closeout packet: `docs/ops/reports/content-collection-phase1-validation-closeout-2438.md` (#2438) — pending Bill / ChatGPT Go / NoGo.
- Project branch: `component/content-collection-phase1`; child PRs must not target `main`.
- `CONTRACT-FROZEN: content-asset-model v1` and `CONTRACT-FROZEN: provenance-rights-publication v1` are independently verified (#2433 / #2434).
- Feature lanes GAL / LIB / MEM / CLUB remain deferred (D-008) until Bill / ChatGPT accept the #2438 CONDITIONAL GO and authorize explicit child issues (no auto-launch).
- CI-001 / CI-002 Phase 1 dry-run/preclearance is complete (D-009 complete); CI-002 apply mode remains deferred.
- AI approval, OCR implementation, crawler expansion, and automatic public publication remain deferred (D-001–D-004).

## Phase 1 objective

Phase 1 should make the Content Collection operating foundation executable without releasing feature lanes prematurely.

Primary outcomes:

1. Reconcile Phase 0 closeout state and stale status references (#2432).
2. Freeze the CC-001 content asset model contract (#2433).
3. Freeze the CC-002 provenance, rights, privacy, and publication-review contract (#2434).
4. Inventory existing CI / PR hygiene / closeout automation before adding new tooling (#2435).
5. Implement or prepare CI-001 PR body generator procedural preclearance (#2436).
6. Implement or prepare CI-002 administrative closeout auto-repair boundary (#2437).
7. Produce Phase 1 validation evidence and downstream release recommendation (#2438).

## Child issue graph

| Order | Issue | Title | Package / Lane | Predecessor | Successor | Launch state |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | #2432 | Phase 1 Gate 0 — Readiness Reconciliation and Stale-State Repair | Gate 0 | #2431 GO | #2433 | CLOSED complete (#2674) |
| 1 | #2433 | CC-001 Content Asset Contract Freeze | CC-001 / P1 | #2432 | #2434 | CLOSED complete (#2675); freeze verified |
| 2 | #2434 | CC-002 Provenance Rights and Publication Contract Freeze | CC-002 / P1 | #2433 | #2435 | CLOSED complete (#2684); freeze verified |
| 3 | #2435 | CI Stage 0 Current-State Gap Analysis | CI Stage 0 / P6 | #2434 | #2436 | CLOSED complete (#2685) |
| 4 | #2436 | CI-001 PR Body Generator Preclearance Tooling | CI-001 / P6 | #2435 | #2437 | CLOSED complete (#2704, #2729) |
| 5 | #2437 | CI-002 Admin Closeout Auto-Repair Boundary | CI-002 / P6 | #2435 and #2436 | #2438 | CLOSED complete (#2738, #2742) |
| 6 | #2438 | Validation Closeout and Downstream Release Recommendation | VAL-001 | #2433 through #2437 | downstream Go / NoGo | Closeout packet ready for Bill / ChatGPT |

## Phase 1 sequencing decision

Default sequence is serial until Bill / ChatGPT explicitly authorize parallelism:

1. #2432 first, because stale-state repair protects the rest of the wave.
2. #2433 and #2434 next, because downstream feature lanes depend on contract freeze.
3. #2435 before CI-001 / CI-002, because existing automation must be inventoried before new tooling.
4. #2436 and #2437 may proceed after #2435 only if their allowlists remain disjoint or explicitly serialized.
5. #2438 is terminal and does not itself launch feature lanes.

## Go / NoGo checklist

Evidence recorded for #2431 launch (see also `content-collection-launch-readiness-checklist.md` rows 18–29):

- [x] #2431 reviewed by Bill / ChatGPT — GO recorded 2026-07-20.
- [x] This document is merged or explicitly accepted as the Phase 1 prep reference (PR #2439; Gate 0 refreshes launch state).
- [x] #2432 through #2438 exist; only the current sequenced task is executable.
- [x] Phase 0 terminal status is reconciled in the package index and launch checklist (#2432 Gate 0).
- [x] CC-001 and CC-002 freeze criteria remain accepted and sequenced (#2433 → #2434).
- [x] CI Stage 0 is accepted as predecessor to CI-001 / CI-002 tooling (#2435 before #2436 / #2437).
- [x] Feature lanes remain blocked until freeze marker verification (D-008).
- [x] Review throttle is accepted: maximum two to three `READY FOR REVIEW` PRs.
- [x] No issue authorizes public publication, AI approval, OCR, crawler expansion, or automatic publication.

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

P5 Club Newspaper remains conditional after freeze because it touches the shared Fan Club shell. Club Newspaper project Phase 0 under #2463 remains a separate design lane and must not be overlapped by this Gate 0 work.

## Parallel execution control

| Lane | Phase 1 state | Parallel rule |
| --- | --- | --- |
| P1 — Content Asset Model | Active only for sequenced #2433/#2434 after Gate 0 | Serial by default |
| P2 — Gallery | Blocked (D-008) | Requires verified freeze marker |
| P3 — Library | Blocked (D-008) | Requires verified freeze marker |
| P4 — Memorabilia | Blocked (D-008) | Requires verified freeze marker |
| P5 — Club Newspaper | Conditional blocked (D-008) | Requires shell-risk review; no overlap with #2463 design lane |
| P6 — CI Orchestration | Conditional (D-009) | Stage 0 before tooling; serialize workflow/script hot zones |

## Stop rules

Stop and request Bill / ChatGPT decision if any task attempts to:

- release GAL / LIB / MEM / CLUB feature implementation before contract freeze;
- introduce public publication without human review;
- use AI, OCR, crawler, or automation to approve publication, rights, privacy, credit, or provenance;
- touch rejected documentation roots such as `docs/ops/programs/**` or `docs/reference/website/content-collection/**`;
- bypass PR review, merge authorization, or reviewer disposition;
- merge or promote to `main` without Production authority;
- overlap active #2294 runner-validation scope or #2463 Club Newspaper design lane.

## Validation

Documentation-only Phase 1 Gate 0 / prep validation:

- `bash scripts/ci/docs_check_headers.sh`
- `node scripts/ci/diataxis_folder_audit.mjs`
- `node .agents/checks/agent-governance-check.mjs`

Implementation tasks must add package-specific validation from their source issues and package docs.

## Acceptance criteria

- Phase 1 issue graph exists and reflects completed vs pending-acceptance state.
- Repository documentation reflects Phase 0 complete and Phase 1 launched under #2431 GO with #2432–#2437 closed complete.
- Freeze markers are independently verified; feature-lane release remains blocked until Bill / ChatGPT accept #2438 CONDITIONAL GO and authorize explicit child issues.
- CI-001 and CI-002 Phase 1 dry-run/preclearance are complete; apply mode remains deferred.
- Bill / ChatGPT can operate from the Phase 1 closeout report without relying on chat memory.
