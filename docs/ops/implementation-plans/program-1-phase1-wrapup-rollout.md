---
Doc Type: Implementation Plan
Audience: Human + AI
Authority Level: Operational Authority
Owns: Program 1 — Phase 1 Wrap-Up orchestration (PMO setup, as-built surfaces, health review, automation classification, Program 2 launch gate)
Does Not Own: Program 2 implementation, website product features, CI maintenance Tasks 002–005 in issue-1075-ci-phase2-closeout-rollout.md, production secrets, or branch protection UI changes
Status: production-ready
Project: program-1-phase1-wrapup-rollout
Owner: Atlas
Execution Mode: orchestrated
Source Issue: 1335
Related Program Issue: 1335
Canonical Reference: /docs/ops/implementation-plans/README.md
Related Issues: #1058, #1075, #1255, #1335
Last Reviewed: 2026-06-04
---

# Program 1 — Phase 1 Wrap-Up Rollout

## Purpose

Draw the hard line under Phase 1 across CI, Website, Docs/DIATAXIS, and OPS.

This plan converts the repository audit and adopted PMO model into orchestrator-ready
tasks only. It does **not** start Program 2 build work. Completion means Phase 1
deliverables are documented, stale trackers are retired or stabilized, operational
health is recorded, automation opportunities are classified, and Program 2 is
authorized to launch with issue-per-task structure.

## Scope

This plan owns:

- PMO registry and critical-path rules for parallel agents
- CI Phase 1 program closeout evidence (issue `#1075` and stale redesign children)
- Website as-built reconciliation (design vs shipped; tracker retirement guidance)
- Docs/DIATAXIS transition **status** report (not full migration execution)
- OPS monitoring snapshot (as-built monitoring surface)
- Operational health review with prioritized findings
- Automation backlog classified into Program 2 vs Program 3
- Program 2 launch gate checklist and sign-off record

This plan does not own:

- CI maintenance implementation (branch protection UI, drift dedup, legacy retirement,
  inventory rewrite) — deferred to Program 2 via
  `issue-1075-ci-phase2-closeout-rollout.md` Tasks 002–005 under `#1058`
- Website feature implementation under `#1255` child projects
- Full `#1132` documentation-remediation workstream execution (Program 3 unless promoted)

## Current Known Truth

- **CI Phase 1:** Tasks 001–006 merged on `main`. As-built reconciliation exists at
  `docs/reference/ci/lgfc-ci-as-built-reconciliation.md`. Post-merge closeout is
  automatic on merged PRs (`post-merge-pr-body-closeout.yml`, PRs #1282, #1298).
  `#1075` and stale redesign child issues remain open pending closeout.
- **CI Phase 2 plan:** `issue-1075-ci-phase2-closeout-rollout.md` is
  `production-ready`. Its Task 001 overlaps Program 1 Task 002; Program 1 runs first.
- **Website Phase 1:** Implementation largely merged per program owner; trackers
  (`LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md`,
  `lgfc-implementation-coverage-map.md`) are stale vs GitHub/issue truth. No website
  as-built reconciliation doc exists yet.
- **Docs/DIATAXIS:** Skeleton enforced (~253 `.md` under `docs/`). `DIATAXIS-MAPPING.md`
  is empty. Split legacy roots remain (`ops/ai/`, `governance/ai/`, `PROMPTS/`).
- **OPS:** Scheduled production-audit, ops-assess, snapshot, B2/D1 sync documented in
  `docs/ops/ci-monitoring-ownership.md`. Known gaps: duplicate `assess-nightly.yml`,
  soft-fail `ops-assess`, manual-only CF Pages retry, launch-readiness not scheduled.
- **Workflow count:** 57 YAML files under `.github/workflows/`; inventory docs still
  reference 54.
- **PMO model:** Program → Child Project → Task → Issue → PR → Verification →
  Closeout adopted by design; not yet recorded in a single registry document.

## Intended Final State

- PMO registry and parallel-agent rules exist and are linked from
  `docs/ops/implementation-plans/README.md`.
- CI program `#1075` is closed with evidence; `#1058` remains open for Program 2 CI work.
- Website as-built reconciliation doc exists and marks stale trackers non-authoritative.
- DIATAXIS transition status report exists with filled mapping table **or** explicit
  row-level backlog for unmigrated paths.
- OPS monitoring snapshot documents triggers, fail-closed vs advisory behavior, and gaps.
- Operational health review lists P0/P1/P2 findings with recommended issue slugs.
- Automation backlog classifies each item as Program 2 or Program 3.
- Program 2 launch gate records sign-off preconditions and authorized child projects.
- No Program 2 implementation plan is marked `issues-created` until Task 008 completes.

## Operating Rule

One orchestrator-labeled issue is active at a time unless the program owner explicitly
authorizes parallel work. Tasks 002–005 may be prepared in parallel by read-only agents
only after Task 001 lands; implementation PRs remain serial per queue guard.

Program 1 Task 002 satisfies the same closeout intent as
`issue-1075-ci-phase2-closeout-rollout.md` Task 001. Do not create duplicate closeout
issues for both plans. After Task 002 completes, annotate phase-2 Task 001 as satisfied
via cross-reference comment on the phase-2 plan issue or closeout evidence doc.

---

## Task 001 — PMO Registry and Critical Path Setup

Type: governance
Agent: atlas
Priority: 1
Depends On: none
Allowed Files:
- `docs/ops/pmo/**`
- `docs/ops/implementation-plans/README.md`
- `docs/governance/**`
- `docs/reference/architecture/orchestration-model.md`
Acceptance Criteria:
- `docs/ops/pmo/program-registry.md` lists Program 1, Program 2, and Program 3 with purpose, child projects, owners, and status.
- `docs/ops/pmo/critical-path.md` defines serial vs parallel rules across CI, Website, Docs, and OPS tracks.
- `docs/ops/pmo/parallel-agent-rules.md` defines safe parallel read-only exploration vs one-implementer-per-task PR rules.
- Registry documents the chain: Program → Child Project → Task → Issue → PR → Verification → Closeout with links to orchestration sources.
- `docs/ops/implementation-plans/README.md` links to the PMO registry.
- Source Issue and Related Program Issue frontmatter on this plan are updated to real GitHub issue numbers (replacing `TBD`).
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert PMO documentation files only.

---

## Task 002 — CI As-Built Closeout

Type: ci
Agent: cursor
Priority: 2
Depends On: Task 001
Parent Program: #1058
Supersedes Issues: #1011, #1009, #1116, #1247, #1196, #1197, #1198, #1199, #1226
Allowed Files:
- `docs/reference/ci/**`
- `docs/ops/**`
- `docs/explanation/ci/**`
Acceptance Criteria:
- Stale redesign task issues (#1196–#1199, #1226) are closed with merge evidence comments.
- Superseded child issues (#1011, #1009, #1116, #1247) are closed with explicit superseded-by references.
- `#1075` is closed with a summary pointing to `lgfc-ci-as-built-reconciliation.md`.
- `#1058` remains open and is documented as the Program 2 CI maintenance umbrella.
- `docs/reference/ci/lgfc-ci-as-built-reconciliation.md` includes a Program 1 closeout section with date, PR references, and pointer to phase-2 maintenance plan Tasks 002–005.
- Cross-reference recorded that `issue-1075-ci-phase2-closeout-rollout.md` Task 001 is satisfied by this task (no duplicate issue factory marker).
- No workflow or runtime behavior changes are introduced.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert closeout documentation updates; GitHub issue state must be restored manually if needed.

---

## Task 003 — Website As-Built Reconciliation

Type: website
Agent: cursor
Priority: 3
Depends On: Task 001
Parent Program: #1255
Allowed Files:
- `docs/reference/website/**`
- `docs/as-built/**`
- `docs/ops/trackers/LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md`
- `docs/reference/lgfc-implementation-coverage-map.md`
- `docs/ops/trackers/THREAD-LOG_Master.md`
- `docs/how-to/website/**`
Acceptance Criteria:
- `docs/reference/website/lgfc-website-as-built-reconciliation.md` exists with Purpose, Scope, Current Known Truth, and Intended Final State sections.
- Document states design authority (`docs/reference/design/LGFC-Production-Design-and-Standards.md`) vs shipped behavior without falsely claiming tracker queue status as implementation truth.
- Merged PR and GitHub issue references document Phase 1 website delivery scope (including T25–T50 disposition as stated by program owner).
- Stale tracker files are marked **non-authoritative for ops decisions** with pointer to reconciliation doc and GitHub issues.
- Variances vs design are listed with recommended Program 2 issue slugs where work remains.
- No application code or workflow changes are introduced.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert website reconciliation and tracker annotation files only.

---

## Task 004 — Docs/DIATAXIS Transition Status

Type: docs
Agent: cursor
Priority: 4
Depends On: Task 001
Allowed Files:
- `docs/reference/DIATAXIS-MAPPING.md`
- `docs/reports/program-1-diataxis-transition-status.md`
- `docs/reference/legacy-to-diataxis-migration-matrix-1132.md`
- `docs/reference/documentation-gap-analysis-1132.md`
- `docs/ops/projects/DIATAXIS-TRANSITION.md`
Acceptance Criteria:
- `docs/reports/program-1-diataxis-transition-status.md` summarizes quadrant health, header enforcement gaps, and legacy path disposition.
- `docs/reference/DIATAXIS-MAPPING.md` contains a non-empty mapping table for all legacy roots called out in the audit (`ops/ai/`, `governance/ai/`, `PROMPTS/`, split trackers) with target path and status (migrated / deferred Program 3 / retain).
- Document explicitly scopes **status only**; full migration execution is deferred unless promoted to Program 2.
- Split agent authority paths have a single recommended canonical target per topic.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
- `node scripts/ci/diataxis_folder_audit.mjs` (report-only; no failures required for this docs-only task)
Rollback:
- Revert mapping and status report files only.

---

## Task 005 — OPS Monitoring Snapshot

Type: docs
Agent: cursor
Priority: 5
Depends On: Task 001
Allowed Files:
- `docs/ops/reports/program-1-ops-monitoring-snapshot.md`
- `docs/ops/ci-monitoring-ownership.md`
- `docs/ops/monitoring-coverage_MASTER.md`
- `docs/reference/ci/ops-runtime-surface.md`
- `scripts/ci/ops_runtime_surface.mjs`
- `tests/ops-runtime-surface.test.mjs`
Acceptance Criteria:
- Snapshot documents every OPS runtime workflow in `ops_runtime_surface.mjs` with trigger class (schedule / main push / manual / post-merge), escalation path, and fail-closed vs advisory verdict.
- Known gaps from audit are recorded: duplicate `assess-nightly.yml`, `ops-assess` soft-fail behavior, manual CF Pages retry, launch-readiness not scheduled, design-compliance inventory drift.
- `monitoring-coverage_MASTER.md` or snapshot cross-links reconcile any classification drift (e.g. design-compliance audit inclusion).
- No workflow YAML behavior changes in this task.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
- `node scripts/ci/ops_runtime_surface.mjs`
- `npx vitest run --config tests/vitest.node.config.ts tests/ops-runtime-surface.test.mjs`
Rollback:
- Revert OPS snapshot and documentation cross-link updates only.

---

## Task 006 — Operational Health Review

Type: docs
Agent: atlas
Priority: 6
Depends On: Task 002, Task 003, Task 004, Task 005
Allowed Files:
- `docs/ops/reports/program-1-operational-health-review.md`
- `docs/ops/pmo/**`
Acceptance Criteria:
- Health review synthesizes findings from Tasks 002–005 plus live repository signals (open issues, workflow count vs inventory, recent failed OPS/post-merge runs).
- Each finding has severity (P0/P1/P2), affected surface (CI / Website / Docs / OPS), evidence link, and recommended **single** follow-up issue slug for Program 2 or Program 3.
- P0 items block Program 2 launch gate unless explicitly waived with rationale in Task 008.
- No code or workflow changes are introduced.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert health review report only.

---

## Task 007 — Automation Backlog Classification

Type: governance
Agent: atlas
Priority: 7
Depends On: Task 006
Allowed Files:
- `docs/ops/reports/program-1-automation-backlog.md`
- `docs/ops/pmo/program-registry.md`
Acceptance Criteria:
- Backlog lists each automation opportunity from the audit and health review with: title, rationale, effort (S/M/L), target program (2 or 3), proposed child project, and dependency notes.
- Program 2 candidates include at minimum: ops-assess hardening, assess-nightly retirement, CF deploy health, launch-readiness CI wiring (if approved).
- Program 3 candidates include items explicitly deferred (external alerting, full tutorial expansion, etc.).
- No implementation PRs are opened from this task; issues are **recommended** not created unless program owner directs.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
Rollback:
- Revert automation backlog report only.

---

## Task 008 — Program 2 Launch Gate

Type: governance
Agent: atlas
Priority: 8
Depends On: Task 007
Allowed Files:
- `docs/ops/reports/program-2-launch-gate.md`
- `docs/ops/pmo/program-registry.md`
- `docs/ops/pmo/critical-path.md`
- `docs/ops/implementation-plans/README.md`
Acceptance Criteria:
- Launch gate checklist confirms Tasks 001–007 deliverables exist and are linked.
- Checklist confirms no open P0 health findings remain unwaived.
- Authorized Program 2 child projects are listed with required preconditions (e.g. CI maintenance via `#1058` phase-2 Tasks 002–005; Website via `#1255` Phase 0 reconciliation).
- Sign-off section records program owner approval date and approver (human).
- Explicit statement: Program 2 implementation plans may move to `issues-created` only after this gate is signed.
- Program 1 umbrella source issue may be closed with pointer to launch gate report when all tasks complete.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert launch gate report and registry status updates only.

---

## Orchestration Verification Expectations

When this plan merges to `main`, the issue factory should:

1. Create Task 001 if no `lgfc-task-id:program-1-phase1-wrapup-rollout:Task-001` marker exists.
2. Label the first created issue `status:queued` only when no open orchestrator-labeled
   issue exists; otherwise `status:blocked` per `openOrchestratorIssueExists()`.
3. Create Tasks 002–008 with `status:blocked` until prior tasks complete and queue
   guard allows advancement.
4. Skip Task 002 issue creation if `issue-1075-ci-phase2-closeout-rollout:Task-001`
   marker exists **and** closeout evidence is already complete; prefer Program 1 Task 002
   as the canonical closeout if both plans are present.
5. Do not mark any Program 2 implementation plan `issues-created` until Task 008
   sign-off is recorded.

## Program 2 Handoff Map (reference only — not executed in Program 1)

| Program 1 output | Program 2 child project |
|------------------|-------------------------|
| Task 002 CI closeout | CI Phase 2 (`#1058`, phase-2 Tasks 002–005) |
| Task 003 website reconciliation | Website Completion, `#1255` phases |
| Task 004 DIATAXIS status | Docs completion packages / curation |
| Task 005 OPS snapshot | OPS Hardening |
| Task 007 automation backlog | Automation / Agent Orchestration |

Program 3 items remain in `program-1-automation-backlog.md` until explicitly promoted.
