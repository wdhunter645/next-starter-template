---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC CI redesign as-built reconciliation, design-vs-as-built variances, deferred implementation items, monitoring ownership map
Does Not Own: GitHub branch protection UI settings, workflow runtime code, secret configuration
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1199, #1075, #1058
Last Reviewed: 2026-06-03
---

# LGFC CI As-Built Reconciliation

## Purpose

This reference records the CI redesign as built on `main` as of 2026-06-03 and
explicitly separates merged implementation, in-flight pull requests, and
deferred follow-up work.

## Reconciliation Baseline

| Source | Role |
|---|---|
| Intended design | `docs/explanation/ci/lgfc-ci-production-design.md` |
| Rollout plan | `docs/ops/implementation-plans/issue-1075-ci-redesign-rollout.md` |
| Workflow inventory | `docs/reference/ci/workflow-inventory.md` |
| Guardrails map | `.github/CI_GUARDRAILS_MAP.md` |

Workflow file count on `main`: 54 files under `.github/workflows/`.

## Implementation Status by Task

| Task | Issue | Status on `main` | Primary evidence |
|---|---|---|---|
| Task 001 PR Hygiene Foundation | #1131 | Merged | PR #1189; `docs/reference/ci/pr-hygiene-foundation.md` |
| Task 002 Merge Protection Consolidation | #1226 | Merged | PR #1229; `docs/reference/ci/merge-protection-surface.md` |
| Task 003 Reviewer Lifecycle Redesign | #1196 | In flight | PR #1239 |
| Task 004 Post-Merge Validation Expansion | #1197 | In flight | PR #1240 |
| Task 005 OPS Runtime Consolidation | #1198 | In flight | PR #1242 |
| Task 006 As-built Documentation Update | #1199 | This document | Documentation-only reconciliation |

## Domain Reconciliation

### Merge Protection

| Intended | As-built on `main` | Variance |
|---|---|---|
| Deterministic binary merge blockers only | Consolidated into `quality`, `gitleaks`, `pr-issue-accounting` | Partial |
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
| Reviewer timing must not block merge | `reviewer-response-completion.yml` still enforces quiet-period and current-head reviewer artifacts synchronously | Not complete until PR #1239 |
| Post-merge reviewer audit | `post_merge_validator.mjs` includes late reviewer findings; dedicated audit wiring expanded in PR #1239 | Partial |

Deferred to PR #1239: protected-scope-only pre-merge blocking and advisory reviewer lifecycle gate.

### Post-Merge Validation

| Intended | As-built on `main` | Variance |
|---|---|---|
| Evidence-driven post-merge checks | `post-merge-intent-verification.yml` runs `post_merge_validator.mjs` | Partial |
| Remediation issues on failure | `post-merge-remediation.yml` exists; failure-only triggering refined in PR #1240 | Partial |
| DIATAXIS post-merge validation | `diataxis-post-merge-validate.yml` remains largely placeholder on `main` | Deferred to PR #1240 |

Deferred to PR #1240: implementation evidence, DIATAXIS audit integration, richer remediation bodies.

### OPS Runtime

| Intended | As-built on `main` | Variance |
|---|---|---|
| OPS workflows separated from merge protection | OPS workflows do not use PR merge blockers | Complete |
| Shared runtime escalation | Workflow-specific inline issue creation remains common on `main` | Deferred to PR #1242 |
| Consolidated OPS naming | B2 and production audit workflows retain legacy display names on `main` | Deferred to PR #1242 |
| Capped Cloudflare retry visibility | `ops-cf-pages-retry.yml` uses `MAX_RETRIES=2` and non-blocking exhaustion summary | Complete |

Deferred to PR #1242: `ops_runtime_escalation.mjs`, `ops-runtime-surface.md`, OPS display-name alignment.

## Deferred and Out-of-Scope Items

| Item | Reason deferred | Owner domain |
|---|---|---|
| Drift gate rebuild and ZIP deduplication inside `gate-drift.yml` | Outside Tasks 002–005 allowlists | Future CI task |
| Retire parked legacy workflows (`ci.yml`, `deploy*.yml`, `test*.yml`, etc.) | Requires separate cleanup PR with retirement evidence | OPS / CI maintenance |
| Retire `assess-nightly.yml` after confirming `ops-assess.yml` coverage | Operational overlap only; not blocking redesign | OPS runtime |
| Preview invariants Cloudflare integration | Preview URL resolution not production-configured | OPS runtime |
| Branch protection UI reconciliation | Repository setting change outside workflow files | Human operator |
| Full workflow inventory table rewrite | Large mechanical update deferred to post-redesign cleanup | Task 006 follow-up |

## Monitoring Behavior and Operational Ownership

| Workflow group | Primary owner | Trigger model | Failure signal | Escalation path |
|---|---|---|---|---|
| Merge protection (`gate-quality`, `gitleaks`, `ops-pr-issue-accounting`) | CI governance | PR / push | Required check failure on PR | Fix PR before merge |
| PR hygiene advisories | CI governance | PR | Advisory comments | Agent/human correction pre-merge |
| Reviewer lifecycle (`reviewer-response-completion`) | CI governance | PR target / review events | Required check failure on PR | PR #1239 redesign |
| Post-merge detection / remediation | CI orchestration | `main` push / merged PR close | Workflow failure on `main`; orchestrator pause | Remediation issue + follow-up PR |
| OPS assessment / production audit | Operations | schedule / manual / scan trigger | Workflow failure + GitHub issue | Ops issue triage |
| OPS main change monitor | Operations | `main` push | Direct-push detection issue | Admin review |
| Snapshot / B2 / D1 runtime jobs | Platform operations | schedule / manual | Workflow failure | Ops issue (expanded in PR #1242) |
| Cloudflare Pages retry helper | Platform operations | manual | Step summary warning only | Manual re-run or ops follow-up |
| CI orchestration engine | CI program | schedule / manual | Paused issue creation | `#1075` program tracking |

Detailed monitoring map: `docs/ops/ci-monitoring-ownership.md`.

## Lessons Learned

- Separating merge protection from reviewer timing removed the largest false-positive source only after Task 002; Task 003 completes that separation on `main`.
- Documentation-only reconciliation must distinguish merged truth from in-flight PR truth to avoid claiming unfinished workflow behavior as complete.
- Surface inventory references (`merge-protection-surface.md`) should be treated as authoritative for merged phases even when the broader workflow inventory table remains historically stale.

## Rollback

Revert only final CI documentation reconciliation files listed in Task 006 allowlists.
