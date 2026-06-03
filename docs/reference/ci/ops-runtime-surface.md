---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC OPS runtime workflow surface, escalation model, retry visibility, evidence preservation expectations
Does Not Own: Pre-merge merge protection gates, post-merge validation authority, website product behavior
Canonical Reference: /docs/explanation/ci/lgfc-ops-runtime-philosophy.md
Related Issues: #1198, #1075, #1058
Last Reviewed: 2026-06-03
---

# LGFC OPS Runtime Surface

## Purpose

This reference documents Task 005 OPS runtime consolidation. OPS runtime
workflows monitor production health after deployment, preserve rollback evidence,
and escalate runtime failures without blocking pull request merge.

## Consolidated Workflows

| Workflow file | Display name | Responsibility |
|---|---|---|
| `ops-assess.yml` | `OPS — Site Assessment` | Route/page-marker assessment via `npm run assess:ci` |
| `ops-cf-pages-retry.yml` | `OPS — Cloudflare Pages Auto-Retry` | Capped Cloudflare Pages retry helper (`MAX_RETRIES=2`) |
| `production-audit.yml` | `OPS — Production Audit` | Playwright production invariants with artifact preservation |
| `ops-main-change-monitor.yml` | `OPS — Main Change Monitor` | Direct-to-main change detection |
| `snapshot.yml` | `OPS — Snapshot Backup` | Repo and Cloudflare Pages rollback evidence |
| `b2-s3-smoke-test.yml` | `OPS — B2 S3 Smoke Test` | Daily B2 connectivity smoke test |
| `b2-d1-daily-sync.yml` | `OPS — B2 D1 Daily Sync` | Incremental B2 to D1 sync |

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
