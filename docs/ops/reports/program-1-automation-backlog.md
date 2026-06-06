---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program 1 Task 007 automation backlog classification, Program 2/3 routing recommendations, and issue-creation guidance for automation candidates
Does Not Own: Workflow YAML changes, application code, GitHub issue creation, GitHub issue closure, or Program 2 launch authorization
Canonical Reference: /docs/ops/implementation-plans/program-1-phase1-wrapup-rollout.md
Related Issues: #1345, #1335, #1058, #1132, #1255, #1112, #1346
Last Reviewed: 2026-06-06
---

# Program 1 Automation Backlog Classification

## Purpose

Classify automation opportunities surfaced by the Program 1 audit, OPS monitoring
snapshot, and Task 006 operational health review. This report routes each candidate
to Program 2 or Program 3 with rationale, effort, proposed child project, and
dependency notes for later owner-directed planning.

## Boundary Statement

This task is **classification only**.

- No implementation PRs are opened from this task.
- No workflow YAML, application code, or runtime configuration changes are made.
- No Program 2 implementation issues are created unless the program owner directs.
- Program 2 candidates remain blocked until Task 008 (`#1346`) records launch-gate
  sign-off or an explicit waiver.

## Source Inputs

| Source | Role in classification |
|---|---|
| Program 1 plan Task 007 | Defines the backlog fields, Program 2 minimum candidates, and Program 3 deferrals |
| Task 005 OPS monitoring snapshot | Supplies OPS runtime gaps: `ops-assess`, `assess-nightly`, Cloudflare retry, launch-readiness scheduling, and design-compliance inventory |
| Task 006 operational health review | Supplies prioritized findings H-001 through H-014 and Program 2/3 routing signals |
| CI as-built reconciliation | Supplies CI maintenance deferrals: drift ZIP deduplication, parked workflow retirement, branch-protection reconciliation, and inventory rewrite |
| Website as-built reconciliation | Supplies website lifecycle drift, launch-readiness, and Program 2 website QA routing |
| DIATAXIS transition status and `#1132` gap analysis | Supplies Program 3 documentation migration, header, tutorial, and legacy-retirement deferrals |
| PMO registry and portfolio worklist | Supplies child-project names and queue/registry drift signals |

## Effort Scale

| Effort | Meaning |
|---|---|
| S | Documentation, configuration decision, or narrowly scoped script/check update |
| M | One focused workflow/script/docs change set with targeted tests and operator evidence |
| L | Multi-surface change, issue batch, or rollout requiring staged verification and owner sequencing |

## Backlog

| ID | Title | Rationale | Effort | Target program | Proposed child project | Dependency notes |
|---|---|---:|:---:|---:|---|---|
| A-001 | OPS assess hardening | Task 005 and H-002 show `ops-assess.yml` can soft-fail because the assess step uses `continue-on-error`; scheduled health may look green while assessment failed. | M | 2 | OPS hardening | Requires Program 2 launch gate; choose fail-closed behavior or an explicit soft-fail reporting contract before workflow edits. |
| A-002 | `assess-nightly` retirement | Task 005 and H-005 show `assess-nightly.yml` overlaps `ops-assess.yml` at 02:00 UTC and is outside the runtime surface inventory. | M | 2 | OPS hardening / CI maintenance | Depends on A-001 coverage proof and legacy workflow retirement sequencing under `#1058`; do not retire until `ops-assess` is canonical. |
| A-003 | Cloudflare deploy health and retry automation | Task 005, H-010, and the CI as-built deferrals show Cloudflare Pages retry is manual-only and preview/deploy health is not fully automated. | M | 2 | OPS hardening | Requires a program-owner decision between automatic retry hook, deploy-health check, or accepted manual runbook; may need Cloudflare signal availability and secrets review. |
| A-004 | Launch-readiness CI wiring | Task 005 and H-011 show launch-readiness e2e specs exist but no scheduled CI workflow runs them; website reconciliation routes T50 to `#1112` / `#1259`. | M | 2 | Website completion / OPS hardening | Only if approved by the program owner; depends on Program 2 QA authorization, stable e2e environment, and launch-gate disposition. |
| A-005 | Design-compliance runtime inventory decision | Task 005 and H-012 show `ops-design-compliance-audit.yml` is documented as alert-only but absent from `OPS_RUNTIME_SURFACE` validation. | S | 2 | OPS hardening | Decide whether to extend the runtime inventory or document explicit exclusion rationale in code/docs under a scoped Program 2 task. |
| A-006 | Workflow inventory rewrite after retirement | H-004 and CI as-built evidence show inventory docs record 54 workflows while the repository has 60 `.yml` files. | L | 2 | CI maintenance | Depends on legacy workflow retirement order; align with phase-2 Task 005 under `#1058` so inventory reflects post-retirement truth. |
| A-007 | Drift gate ZIP deduplication | CI as-built defers duplicate ZIP enforcement in `gate-drift.yml`; redundant gates create maintenance drag and confusing failure ownership. | M | 2 | CI maintenance | Sequenced by phase-2 Task 003 under `#1058`; requires targeted tests proving ZIP enforcement remains covered by `gate-quality.yml`. |
| A-008 | Parked legacy workflow retirement | CI as-built defers retirement of parked `ci`, `deploy`, and `test` workflows beyond the duplicate `assess-nightly` case. | L | 2 | CI maintenance | Sequenced by phase-2 Task 004 under `#1058`; requires evidence that active merge protection and OPS runtime paths do not depend on retired workflows. |
| A-009 | Post-merge remediation and closeout stabilization | H-001 and H-007 show 34 open `post-merge-failure` issues plus a two-PR body-remediation pattern that can validate the wrong PR number. | L | 2 | CI maintenance / Automation and agent orchestration | P0 launch-gate item unless waived; requires closeout-chain design before changing issue automation or queue advancement behavior. |
| A-010 | CI redesign orphan closeout batch support | H-003 shows open superseded redesign issues (`#1011`, `#1009`, `#1199`) obscure true CI state even after merge evidence exists. | S | 2 | CI maintenance / Automation and agent orchestration | Atlas/program-owner closeout action only; this report recommends no automated closure without explicit owner direction. |
| A-011 | Website tracker/GitHub lifecycle reconciliation | H-006 and Task 003 show stale tracker rows conflict with GitHub issue/PR evidence for website T-tasks. | M | 2 | Website completion | Depends on `#1255` Phase 0 reconciliation and owner-approved disposition comments; do not revive stale tracker rows as implementation authority. |
| A-012 | PMO portfolio worklist sync automation | H-013 shows the portfolio worklist lagged after Tasks 002-005 merged, creating stale "next eligible" guidance. | S | 2 | Automation and agent orchestration | Depends on deciding whether registry, issue labels, or merged PR state is authoritative for generated worklist updates. |
| A-013 | Queue label conflict reconciliation | H-014 shows `#1344` had both `status:blocked` and `status:implementation`, exposing queue-state ambiguity. | M | 2 | Automation and agent orchestration | Requires a single label-state contract and post-merge closeout handoff before any label mutation automation changes. |
| A-014 | DIATAXIS legacy-root migration execution | H-008 and Task 004 defer `ops/ai/`, `governance/ai/`, and `PROMPTS/` migration/retirement to `#1132`. | L | 3 | Documentation remediation (`#1132`) | Program 3 unless promoted; depends on row-level migration PRs, manifest updates, and conflict-resolution authority. |
| A-015 | Header enforcement cleanup for deferred docs | H-009 and Task 004 identify pre-existing header gaps in `docs/templates/ai-build-issue-template.md` and legacy `PROMPTS/` files. | S | 3 | Documentation remediation (`#1132`) | Keep separate from Task 007; should run as a scoped docs remediation task with header checks. |
| A-016 | External alerting integrations | Program 1 Task 007 and PMO registry explicitly defer external alerting integrations beyond Phase 1 classification. | L | 3 | Deferred OPS observability | Requires provider/tool selection, secret-management review, alert-noise policy, and owner promotion before implementation. |
| A-017 | Full tutorial expansion | Program 1 Task 007, DIATAXIS status, and DIATAXIS transition project defer non-exhaustive tutorials and full tutorial build-out. | L | 3 | Documentation tutorials and curation | Program 3 unless promoted; depends on content owner priorities and `#1132` documentation package sequencing. |
| A-018 | Legacy retirement package and archive manifest completion | `#1132` gap analysis and Task 004 defer legacy retirement decisions, migration manifest rows, and archive/disposition execution. | M | 3 | Documentation remediation (`#1132`) | Depends on completed migration matrix rows and owner-approved keep/merge/split/archive/delete criteria. |

## Program Routing Summary

| Target program | Candidate IDs | Notes |
|---|---|---|
| Program 2 | A-001 through A-013 | Eligible for Program 2 planning only after Task 008 launch-gate approval or explicit waiver. |
| Program 3 | A-014 through A-018 | Deferred holding items; promote only by program-owner decision. |

## Minimum Candidate Coverage

Task 007 required Program 2 coverage is represented as follows:

- OPS assess hardening: A-001
- `assess-nightly` retirement: A-002
- Cloudflare deploy health: A-003
- Launch-readiness CI wiring if approved: A-004

Task 007 required Program 3 coverage is represented as follows:

- External alerting: A-016
- Full tutorial expansion: A-017
- Broader DIATAXIS/documentation remediation deferrals: A-014, A-015, A-018

## Issue Creation Guidance

Do **not** create implementation issues from this report during Program 1 Task 007.
Recommended next action is for the program owner to use Task 008 launch-gate
sign-off to authorize, waive, or defer Program 2 candidates. Program 3 candidates
remain in the holding area until promoted.

## Validation

Required validation for this task:

```bash
./scripts/ci/docs_check_headers.sh .
```

Repo-wide header validation may disclose pre-existing out-of-scope header gaps
identified by Task 004; changed files must pass header validation before handoff.
