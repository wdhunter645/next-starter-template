---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC CI redesign as-built reconciliation, design-vs-as-built variances, deferred implementation items, monitoring ownership map
Does Not Own: GitHub branch protection UI settings, workflow runtime code, secret configuration
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1199, #1075, #1058, #1335, #1340
Last Reviewed: 2026-06-04
---

# LGFC CI As-Built Reconciliation

## Purpose

This reference records the CI redesign as built on `main` as of 2026-06-03 after
Tasks 001 through 005 merged and Task 006 completes documentation reconciliation.

## Reconciliation Baseline

| Source | Role |
|---|---|
| Intended design | `docs/explanation/ci/lgfc-ci-production-design.md` |
| Rollout plan | `docs/ops/implementation-plans/issue-1075-ci-redesign-rollout.md` |
| Workflow inventory | `docs/reference/ci/workflow-inventory.md` |
| Guardrails map | `.github/CI_GUARDRAILS_MAP.md` |

Workflow file count on `main`: 60 files under `.github/workflows/` as of 2026-06-04
(inventory table in `workflow-inventory.md` remains stale; rewrite deferred to
Program 2 phase-2 Task 005 under `#1058`).

## Implementation Status by Task

| Task | Issue | Status on `main` | Primary evidence |
|---|---|---|---|
| Task 001 PR Hygiene Foundation | #1131 | Merged | PR #1189; `docs/reference/ci/pr-hygiene-foundation.md` |
| Task 002 Merge Protection Consolidation | #1226 | Merged | PR #1229; `docs/reference/ci/merge-protection-surface.md` |
| Task 003 Reviewer Lifecycle Redesign | #1196 | Merged | PR #1239; `docs/reference/ci/reviewer-lifecycle-surface.md` |
| Task 004 Post-Merge Validation Expansion | #1197 | Merged | PR #1240; `docs/reference/ci/post-merge-validation-surface.md` |
| Task 005 OPS Runtime Consolidation | #1198 | Merged | PR #1242; `docs/reference/ci/ops-runtime-surface.md` |
| Task 006 As-built Documentation Update | #1199 | Merged | PR #1244; `docs/reference/ci/lgfc-ci-as-built-reconciliation.md` |

Task 005 merged before Task 004 out of planned order. No merge conflicts resulted,
but rollout bookkeeping should treat both as complete on `main`.

Phase 2 closeout and maintenance tasks are defined in
`docs/ops/implementation-plans/issue-1075-ci-phase2-closeout-rollout.md`.

## Domain Reconciliation

### Merge Protection

| Intended | As-built on `main` | Variance |
|---|---|---|
| Deterministic binary merge blockers only | Consolidated into `quality`, `gitleaks`, `ops-pr-issue-accounting` | Complete for Task 002 |
| No duplicate ZIP blockers | `gate-zip-safety.yml` retired; ZIP checks in `gate-quality.yml` | Complete for Task 002 |
| Branch protection docs match checks | Documented in `merge-protection-surface.md` | Complete for Task 002 |
| Drift gate no longer duplicate ZIP enforcement | `gate-drift.yml` still runs legacy ZIP checks | Deferred beyond Task 002 |

Authoritative merge-protection checklist: `docs/reference/ci/merge-protection-surface.md`.

### PR Hygiene

| Intended | As-built on `main` | Variance |
|---|---|---|
| Corrective/advisory first | Intent labeler, docs guardrails, DIATAXIS folder check are advisory during foundation rollout | Complete for Task 001 |
| Non-blocking metadata correction | `scripts/ci/pr_hygiene_audit.mjs` and advisory PR comments | Complete for Task 001 |

Authoritative hygiene reference: `docs/reference/ci/pr-hygiene-foundation.md`.

### Reviewer Lifecycle

| Intended | As-built on `main` | Variance |
|---|---|---|
| Reviewer timing must not block merge | `reviewer-response-completion.yml` uses `reviewer_lifecycle_gate.mjs`; quiet-period PR-body rituals removed | Complete for Task 003 |
| Protected-scope trusted review evidence | Current-head trusted review artifact required only on protected CI paths | Complete for Task 003 |
| Trusted reviewer evidence model | Documented in `docs/reference/ci/trusted-reviewer-evidence-gate.md` (#1248/#1251) | Complete |
| Post-merge reviewer audit | Late trusted reviewer findings audited via `post_merge_validator.mjs` | Complete for Task 003/004 |

Authoritative reviewer reference: `docs/reference/ci/reviewer-lifecycle-surface.md`.

### Post-Merge Validation

| Intended | As-built on `main` | Variance |
|---|---|---|
| Evidence-driven post-merge checks | `post-merge-intent-verification.yml` aggregates metadata, implementation, DIATAXIS, reviewer, and workflow evidence | Complete for Task 004 |
| Remediation issues on failure | `post-merge-remediation.yml` runs only when Post-Merge Detection fails | Complete for Task 004 |
| DIATAXIS post-merge validation | `diataxis-post-merge-validate.yml` uploads merged DIATAXIS evidence | Complete for Task 004 |
| Source issue closeout | `post_merge_source_issue_closeout.mjs` closes source issues after successful validation (#1249) | Complete |

Authoritative post-merge reference: `docs/reference/ci/post-merge-validation-surface.md`.

### OPS Runtime

| Intended | As-built on `main` | Variance |
|---|---|---|
| OPS workflows separated from merge protection | OPS workflows do not use PR merge blockers | Complete |
| Shared runtime escalation | `scripts/ci/ops_runtime_escalation.mjs` creates or updates ops issues with evidence | Complete for Task 005 |
| Consolidated OPS naming | B2, snapshot, and production audit workflows use OPS display names per surface inventory | Complete for Task 005 |
| Capped Cloudflare retry visibility | `ops-cf-pages-retry.yml` uses `MAX_RETRIES=2` and non-blocking exhaustion summary | Complete |

Authoritative OPS reference: `docs/reference/ci/ops-runtime-surface.md`.

## Deferred and Out-of-Scope Items

| Item | Reason deferred | Owner domain |
|---|---|---|
| Drift gate rebuild and ZIP deduplication inside `gate-drift.yml` | Outside Tasks 001–005 allowlists | Future CI task |
| Retire parked legacy workflows (`ci.yml`, `deploy*.yml`, `test*.yml`, etc.) | Requires separate cleanup PR with retirement evidence | OPS / CI maintenance |
| Retire `assess-nightly.yml` after confirming `ops-assess.yml` coverage | Operational overlap only; not blocking redesign | OPS runtime |
| Preview invariants Cloudflare integration | Preview URL resolution not production-configured | OPS runtime |
| Branch protection UI reconciliation | Repository setting change outside workflow files | Human operator |
| Full workflow inventory table rewrite | Large mechanical update deferred from Task 006 | CI maintenance follow-up |

## Monitoring Behavior and Operational Ownership

| Workflow group | Primary owner | Trigger model | Failure signal | Escalation path |
|---|---|---|---|---|
| Merge protection (`gate-quality`, `gitleaks`, `ops-pr-issue-accounting`) | CI governance | PR / push | Required check failure on PR | Fix PR before merge |
| PR hygiene advisories | CI governance | PR | Advisory comments | Agent/human correction pre-merge |
| Reviewer lifecycle (`reviewer-response-completion`) | CI governance | PR target / review events | Required check failure on protected CI scope | Trusted review + thread resolution |
| Post-merge detection / remediation | CI orchestration | `main` push / merged PR close | Workflow failure on `main`; orchestrator pause | Remediation issue + follow-up PR |
| OPS assessment / production audit | Operations | schedule / manual / scan trigger | Workflow failure + GitHub issue via `ops_runtime_escalation.mjs` | Ops issue triage |
| OPS main change monitor | Operations | `main` push | Direct-push detection issue | Admin review |
| Snapshot / B2 / D1 runtime jobs | Platform operations | schedule / manual | Workflow failure + ops issue | Ops issue triage |
| Cloudflare Pages retry helper | Platform operations | manual | Step summary warning only | Manual re-run or ops follow-up |
| CI orchestration engine | CI program | schedule / manual | Paused issue creation | `#1058` maintenance tracking after `#1075` closeout |

Detailed monitoring map: `docs/ops/ci-monitoring-ownership.md`.

## Open issue assessment and program decision

Assessment date: 2026-06-04 (Program 1 Task 002 closeout documentation).

| issue | GitHub state (2026-06-04) | Closeout disposition | Rationale |
|---|---|---|---|
| `#1075` project: CI-ORCH-01 | Closed | Verify evidence comment | Redesign complete; closed 2026-06-04 |
| `#1058` CI workflow normalization | Open | **Keep open** | Program 2 CI maintenance umbrella (phase-2 Tasks 002–005) |
| `#1247` Trusted reviewer evidence gate design | Closed | Verify superseded-by | Docs merged via #1248/#1251 |
| `#1116` CI remediation issue generation | Closed | Verify superseded-by | Absorbed into post-merge validation (#1240) |
| `#1011` Reviewer lifecycle transition tracking | Open | Close after Atlas approval | Superseded by Task 003 (#1239) |
| `#1009` Post-merge reviewer audit parser verification | Open | Close after Atlas approval | Superseded by Task 003 lifecycle gate |
| `#1196`–`#1198`, `#1226` redesign tasks | Closed | Verify merge evidence | Merged PRs #1239, #1240, #1242, #1229 |
| `#1199` Task 006 as-built docs | Open | Close after Atlas approval | Merged PR #1244 |

Decision unchanged: **Do not create a new CI redesign project.** Continue remaining
work under `#1058` through `issue-1075-ci-phase2-closeout-rollout.md` Tasks 002–005
after Program 1 Task 008 launch gate.

Recommended issue comments: `docs/ops/program-1-task-002-ci-closeout-evidence.md`

## Program 1 Task 002 — CI As-Built Closeout

| Field | Value |
|---|---|
| Program | Program 1 — Phase 1 Wrap-Up (`#1335`) |
| Task issue | `#1340` — CI As-Built Closeout |
| Closeout documentation date | 2026-06-04 |
| Task 001 dependency | PMO registry merged PR `#1347` (merge `c5a4c3f763d9`) |
| Task 002 implementation PR | Pending Atlas review (this deliverable) |

### Closeout summary

Program 1 Task 002 records CI redesign as-built closeout evidence only. No workflow
YAML or runtime behavior changes are introduced in this task.

This section satisfies the closeout intent of
`issue-1075-ci-phase2-closeout-rollout.md` **Task 001**. Do not create a duplicate
orchestrator issue for phase-2 Task 001 when this closeout evidence is on `main`.

### Evidence references

| Evidence | Location |
|---|---|
| As-built reconciliation (this document) | `docs/reference/ci/lgfc-ci-as-built-reconciliation.md` |
| Closeout comments and issue ledger | `docs/ops/program-1-task-002-ci-closeout-evidence.md` |
| PMO critical path | `docs/ops/pmo/critical-path.md` |
| Phase-1 redesign rollout (completed) | `docs/ops/implementation-plans/issue-1075-ci-redesign-rollout.md` |

### Redesign merge evidence (Tasks 001–006)

| Task | Issue | Merge PR |
|---|---|---|
| 001 PR Hygiene | `#1131` | `#1189` |
| 002 Merge Protection | `#1226` | `#1229` |
| 003 Reviewer Lifecycle | `#1196` | `#1239` |
| 004 Post-Merge Validation | `#1197` | `#1240` |
| 005 OPS Runtime | `#1198` | `#1242` |
| 006 As-built Documentation | `#1199` | `#1244` |

Automatic post-merge closeout automation: PRs `#1282`, `#1298`. Batch remediation:
`#1271`, `#1294`, `#1312`.

### Program 2 handoff — `#1058` maintenance (not executed in Task 002)

After Program 1 Task 008 launch gate, execute phase-2 plan Tasks **002–005** under
`issue-1075-ci-phase2-closeout-rollout.md`:

| Phase-2 task | Focus |
|---|---|
| Task 002 | Branch protection reconciliation |
| Task 003 | Drift gate ZIP deduplication |
| Task 004 | Legacy workflow retirement |
| Task 005 | Workflow inventory table rewrite |

Orchestrator issues `#1273`–`#1276` remain blocked until Program 2 authorization.

### GitHub issue closeout status

GitHub issues are **not** closed by this documentation task. Atlas applies comments
from `program-1-task-002-ci-closeout-evidence.md` after Task 002 implementation PR
merge and post-merge verification.

| Priority | Issues needing Atlas closeout action |
|---|---|
| Open | `#1011`, `#1009`, `#1199` |
| Verify comments | `#1075` (already closed), closed redesign tasks `#1196`–`#1198`, `#1226`, `#1116`, `#1247` |
| Keep open | `#1058` |

## Website Program Boundary (Out of Scope)

Website implementation under `#1053` is not part of CI redesign Tasks 001–006. This
CI reconciliation does **not** assert that website tasks T25–T50 are complete.

Operational truth for website work must be verified from GitHub issues and merged
PRs. Files such as `docs/ops/trackers/LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md`
and `docs/reference/lgfc-implementation-coverage-map.md` remain **stale on `main`**
(for example, they may still list T43 as active and T44–T50 as backlog) and must
not be used as the sole ops reference until a dedicated website as-built
reconciliation is produced.

## Lessons Learned

- Separating merge protection from reviewer timing removed the largest false-positive source after Task 002; Task 003 completed protected-scope-only blocking on `main`.
- Task 005 merged before Task 004 without code conflict because domains are disjoint, but serial rollout bookkeeping must record actual merge order separately from dependency intent.
- Documentation-only reconciliation must be refreshed after late merges so Task 006 does not describe in-flight PRs as pending once they land on `main`.
- Surface inventory references should be treated as authoritative for merged phases even when the broader workflow inventory table remains historically stale.

## Rollback

Revert only final CI documentation reconciliation files listed in Task 006 allowlists.
