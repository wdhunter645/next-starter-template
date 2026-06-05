---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC OPS runtime workflow surface, escalation model, retry visibility, evidence preservation expectations
Does Not Own: Pre-merge merge protection gates, post-merge validation authority, website product behavior
Canonical Reference: /docs/explanation/ci/lgfc-ops-runtime-philosophy.md
Related Issues: #1198, #1075, #1058, #1343
Last Reviewed: 2026-06-05
---

# LGFC OPS Runtime Surface

## Purpose

This reference documents Task 005 OPS runtime consolidation and the Program 1
Task 005 monitoring snapshot. OPS runtime workflows monitor production health
after deployment, preserve rollback evidence, and escalate runtime failures
without blocking pull request merge.

**Monitoring snapshot (Task 005):** `docs/ops/reports/program-1-ops-monitoring-snapshot.md`

## Consolidated Workflows

| Workflow file | Display name | Trigger class | Escalation | PR merge | Runtime |
|---|---|---|---|---|---|
| `ops-assess.yml` | `OPS — Site Assessment` | schedule, main-push, manual | `assessment-failure` | Advisory | Soft-fail |
| `ops-cf-pages-retry.yml` | `OPS — Cloudflare Pages Auto-Retry` | manual | `optional-recovery` | Advisory | Advisory |
| `production-audit.yml` | `OPS — Production Audit` | schedule, main-push, manual | `change-ops` | Advisory | Fail-closed |
| `ops-main-change-monitor.yml` | `OPS — Main Change Monitor` | main-push, manual | `unapproved-main-change` | Advisory | Fail-closed |
| `snapshot.yml` | `OPS — Snapshot Backup` | schedule, main-push, manual | `ops-runtime-failure` | Advisory | Fail-closed |
| `b2-s3-smoke-test.yml` | `OPS — B2 S3 Smoke Test` | schedule, manual | `ops-runtime-failure` | Advisory | Fail-closed |
| `b2-d1-daily-sync.yml` | `OPS — B2 D1 Daily Sync` | schedule, manual | `ops-runtime-failure` | Advisory | Fail-closed |

Metadata fields are authoritative in `OPS_RUNTIME_SURFACE` inside
`scripts/ci/ops_runtime_surface.mjs`.

## Shared Escalation Model

Runtime failures use `scripts/ci/ops_runtime_escalation.mjs` to create or update
GitHub issues with workflow run evidence, failure details, and required action
steps. OPS runtime workflows remain non-blocking for pull request merge.

## Evidence Preservation

OPS runtime workflows should upload artifacts or summaries where available:

- assessment reports under `reports/assess/**`
- Playwright production reports
- repo and Cloudflare snapshot JSON artifacts
- capped retry exhaustion summaries for Cloudflare Pages recovery

## Validation

The repository inventory validator lives at
`scripts/ci/ops_runtime_surface.mjs`.

## Rollback

Revert OPS workflow/script consolidation while preserving prior snapshot and
audit artifacts.
