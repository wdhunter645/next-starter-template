---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program 1 Task 005 OPS monitoring snapshot, OPS runtime workflow trigger/escalation/verdict matrix, and known audit gap register
Does Not Own: Workflow YAML behavior changes, branch protection settings, or Program 2 hardening execution
Canonical Reference: /docs/reference/ci/ops-runtime-surface.md
Related Issues: #1343, #1335, #1058
Last Reviewed: 2026-06-05
---

# Program 1 OPS Monitoring Snapshot

## Purpose

Record Program 1 Task 005 (`#1343`) OPS monitoring **as built on `main`** as of
2026-06-05. This snapshot documents every workflow in
`scripts/ci/ops_runtime_surface.mjs` with trigger class, escalation path, and
fail-closed vs advisory verdict. It reconciles classification drift against
`docs/ops/monitoring-coverage_MASTER.md` and records known audit gaps for Program 2.

## Boundary Statement

This task is **documentation and inventory only**.

- No workflow YAML behavior changes
- No branch protection or required-check changes
- Known gaps are recorded for Program 2 CI maintenance (`#1058`), not fixed here

## Assessment Baseline

| Source | Role |
|---|---|
| Program 1 plan | `docs/ops/implementation-plans/program-1-phase1-wrapup-rollout.md` Task 005 |
| OPS runtime inventory | `scripts/ci/ops_runtime_surface.mjs` |
| OPS runtime reference | `docs/reference/ci/ops-runtime-surface.md` |
| Monitoring ownership | `docs/ops/ci-monitoring-ownership.md` |
| Coverage master | `docs/ops/monitoring-coverage_MASTER.md` |
| CI as-built gaps | `docs/reference/ci/lgfc-ci-as-built-reconciliation.md` |

Assessment date: **2026-06-05**.

## OPS Runtime Workflow Matrix

Authoritative inventory: `OPS_RUNTIME_SURFACE` in `scripts/ci/ops_runtime_surface.mjs`.
All listed workflows are **non-blocking for pull request merge** (advisory at the
PR gate). Runtime failures escalate via `scripts/ci/ops_runtime_escalation.mjs` or
workflow-specific issue creation.

| Workflow file | Display name | Trigger class | Escalation path | PR merge verdict | Runtime verdict | Notes |
|---|---|---|---|---|---|---|
| `ops-assess.yml` | OPS — Site Assessment | schedule, main-push¹, manual | `assessment-failure` label / GitHub issue on schedule or path push | **Advisory** | **Soft-fail**³ | Route/page-marker health via `npm run assess:ci` |
| `ops-cf-pages-retry.yml` | OPS — Cloudflare Pages Auto-Retry | manual | `optional-recovery`; capped retry (`MAX_RETRIES=2`) | **Advisory** | **Advisory** | No automatic trigger on deploy failure |
| `production-audit.yml` | OPS — Production Audit | schedule, main-push¹, manual | `change-ops` via ops runtime escalation | **Advisory** | **Fail-closed**⁴ | Playwright production invariants + artifacts |
| `ops-main-change-monitor.yml` | OPS — Main Change Monitor | main-push, manual | `unapproved-main-change` issue | **Advisory** | **Fail-closed**⁴ | Detects direct pushes to `main` |
| `snapshot.yml` | OPS — Snapshot Backup | schedule, main-push², manual | `ops-runtime-failure` | **Advisory** | **Fail-closed**⁴ | Repo + Cloudflare Pages rollback evidence |
| `b2-s3-smoke-test.yml` | OPS — B2 S3 Smoke Test | schedule, manual | `ops-runtime-failure` | **Advisory** | **Fail-closed**⁴ | Daily connectivity smoke before D1 sync |
| `b2-d1-daily-sync.yml` | OPS — B2 D1 Daily Sync | schedule, manual | `ops-runtime-failure` | **Advisory** | **Fail-closed**⁴ | Incremental B2 → D1 sync with pre-sync smoke |

¹ Path-filtered push to `main` via `docs/ops/scan-trigger.md` (assessment / production audit).  
² Path-filtered push for snapshot workflow/script paths.  
³ **Soft-fail:** assess step uses `continue-on-error: true`; job may succeed while assessment failed — see Known Gaps.  
⁴ Job fails on error; workflow run shows failure and escalation may open/update issues.

### Trigger class definitions

| Class | Meaning |
|---|---|
| **schedule** | Cron-triggered OPS monitoring |
| **main-push** | Push to `main` (all files or path-filtered) |
| **manual** | `workflow_dispatch` |
| **post-merge** | Not represented in `OPS_RUNTIME_SURFACE`; owned by Post-Merge Detection (`post-merge-intent-verification.yml`) |

### Verdict definitions

| Verdict | Meaning |
|---|---|
| **Advisory (PR merge)** | Does not block PR merge or branch protection |
| **Soft-fail (runtime)** | Failure may not fail the workflow job (operator must read artifacts/summary) |
| **Fail-closed (runtime)** | Workflow job fails; escalation path applies |

## Related OPS Workflows (outside `OPS_RUNTIME_SURFACE`)

These OPS workflows run on `main` but are **not** in `ops_runtime_surface.mjs` inventory validation:

| Workflow file | Display name | Trigger class | In snapshot inventory? | Notes |
|---|---|---|---|---|
| `assess-nightly.yml` | Site Assessment (Nightly Drift Detection) | schedule, manual | **No — duplicate gap** | Overlaps `ops-assess.yml` schedule (02:00 UTC) |
| `ops-design-compliance-audit.yml` | OPS — Design Compliance Audit | schedule, main-push¹, manual | **No — inventory drift** | Alert-only; PR `design-compliance-warn` is separate pre-merge advisory |
| `design-compliance-warn.yml` | (pre-merge PR check) | pull_request | N/A | Pre-merge advisory, not OPS runtime |
| Launch-readiness e2e specs | (tests only) | — | **No scheduled workflow** | `tests/e2e/launch-readiness-*.spec.ts` exist; no CI schedule |

## Known Audit Gaps (Program 2 follow-up)

Recorded per Program 1 plan Task 005; execution deferred to CI Phase 2 under `#1058`.

| Gap | Evidence on `main` | Program 2 disposition |
|---|---|---|
| Duplicate `assess-nightly.yml` | Both `assess-nightly.yml` and `ops-assess.yml` run 02:00 UTC assessment | Retire duplicate; single canonical OPS assessment workflow |
| `ops-assess` soft-fail behavior | `continue-on-error: true` on assess step; failure issue step uses `if: failure()` | Harden: fail job on assessment failure or explicit soft-fail reporting contract |
| Manual-only Cloudflare Pages retry | `ops-cf-pages-retry.yml` is `workflow_dispatch` only | Wire automatic retry hook or document manual runbook as accepted ops model |
| Launch-readiness not scheduled | E2e specs exist; no scheduled launch-readiness workflow on `main` | Add scheduled workflow or defer with explicit waiver in launch gate |
| Design-compliance inventory drift | `ops-design-compliance-audit.yml` monitored in ops docs but absent from `OPS_RUNTIME_SURFACE` | Extend inventory or document explicit exclusion rationale in `ops_runtime_surface.mjs` |

## Classification Reconciliation

| Document | Before Task 005 | After Task 005 |
|---|---|---|
| `monitoring-coverage_MASTER.md` | Listed CI/OPS generically | Cross-links this snapshot + OPS runtime matrix |
| `ci-monitoring-ownership.md` | OPS runtime summary only | Links snapshot; trigger/verdict detail in snapshot |
| `ops-runtime-surface.md` | Workflow list without trigger matrix | Snapshot table + metadata fields in `ops_runtime_surface.mjs` |

**Design-compliance drift resolved in docs:** pre-merge advisory =
`design-compliance-warn.yml`; scheduled OPS observability =
`ops-design-compliance-audit.yml` (alert-only, not in runtime surface validator).

## Validation Commands

Task 005 validation (same as issue `#1343`):

```bash
./scripts/ci/docs_check_headers.sh .          # disclose pre-existing template gap if repo-wide fails
./scripts/ci/docs_canonical_hashes_verify.sh .
node scripts/ci/ops_runtime_surface.mjs
npx vitest run --config tests/vitest.node.config.ts tests/ops-runtime-surface.test.mjs
```

## Related Documents

| Document | Role |
|---|---|
| `docs/reference/ci/ops-runtime-surface.md` | Reference baseline for OPS runtime consolidation |
| `docs/ops/ci-monitoring-ownership.md` | Operator/agent ownership and escalation summary |
| `docs/ops/monitoring-coverage_MASTER.md` | Master coverage map cross-link |
| `docs/reference/ci/lgfc-ci-as-built-reconciliation.md` | CI redesign gaps and phase-2 handoff |
