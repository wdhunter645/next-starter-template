---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Workflow-health reconciliation, retention, pilot qualification, disable/rollback semantics, and operator handoff for #2680
Does Not Own: Event inventory (#2886), adapters/materializer/SLO (#2887), static view formulas (#2888), Production promotion
Canonical Reference: /scripts/workflow-health/reconcile.mjs
Related Issues: #2680, #2889, #2888, #2887, #2886
Last Reviewed: 2026-08-01
---

# Workflow-health reconciliation, retention, pilot, and operator handoff

## Purpose

Implement work unit #2889 (2680-004): scheduled derived-state repair,
deduplication, retention/pruning, seeded-failure pilot validation, disable and
rollback procedures, and operator documentation. Completing this unit qualifies
the integrated `component/workflow-health-observability` candidate; it does
**not** authorize Production promotion.

## Modules

| Module | Role |
| --- | --- |
| `scripts/workflow-health/config.mjs` | Enable/disable + retention / watcher defaults |
| `scripts/workflow-health/retention.mjs` | 30-day detail and 13-month aggregate pruning |
| `scripts/workflow-health/reconcile.mjs` | Idempotent repair, gap emission, view/store write |
| `scripts/workflow-health/pilot.mjs` | Seeded-failure qualification entry point |
| `.github/workflows/workflow-health-reconcile.yml` | Fixture pilot + optional scheduled generation |

Machine-readable modules are canonical where this document and code disagree.

## Ground rules

1. **Derived state only.** Reconciliation never creates authority, dispatches
   work, approves PRs, or merges to `main`.
2. **Missing evidence → unknown.** When `emitGaps` is enabled, inventory gaps
   are forced visible as `unknown_evidence_missing`. Healthy pass is never
   fabricated for an uninstrumented boundary.
3. **Deduplication via ingest.** Replay uses the #2887 scoped idempotency /
   supersession rules.
4. **Retention is derived-store only.** Pruning removes old envelopes and daily
   aggregates from generated artifacts. Authoritative GitHub Issues, PRs,
   comments, workflow runs, and evidence are preserved.
5. **Idle visibility.** Executable-but-idle work must appear in Live Flow after
   a reconcile pass. The informational watcher interval remains five minutes
   (config/SLO + local wake loop). The GitHub Actions artifact refresh runs on
   a coarser six-hour cadence so reporting does not burn Actions minutes.
6. **Zero added paid service.** Generation uses repository-hosted Node scripts
   and GitHub Actions artifacts, following the PMO dashboard pattern.
7. **Disable without destruction.** `WORKFLOW_HEALTH_DISABLED=1` (or
   `config.enabled: false`) skips generation and leaves prior source events
   untouched.

## Retention contract

| Store | Window | Owner module |
| --- | --- | --- |
| Detailed envelopes | 30 days | `pruneDetailedEvents` |
| Daily aggregates | 13 months (30-day month units) | `pruneDailyAggregates` |

## Pilot qualification cases

`node scripts/workflow-health/pilot.mjs` (and the vitest suite) prove:

- executable-but-idle work is visible in Live Flow;
- a seeded Bridge failure degrades `bridge` without marking total workflow failure;
- stale in-progress transactions appear under Exceptions;
- evidence-missing rows stay `unknown` and never flip healthy;
- detail retention prunes only derived events;
- disable skips generation and preserves source events;
- prune helpers never claim to delete authoritative evidence;
- no paid service or execution authority is introduced.

## Disable, recovery, and rollback

| Action | How | Effect |
| --- | --- | --- |
| Disable | Set `WORKFLOW_HEALTH_DISABLED=1` on the runner / workflow env | Reconcile returns `disabled: true`, writes no views |
| Recover | Unset the flag and re-run reconcile / workflow | Derived state rebuilt from retained store + new envelopes |
| Rollback component | Revert this task's component-branch PR | Removes reconciliation code; GitHub evidence remains |
| Rollback artifacts | Delete or stop publishing `site/workflow-health` outputs | Operators fall back to GitHub Issue/PR inspection |

## Operator ownership

| Concern | Owner |
| --- | --- |
| Data generation / component health | Implementation / Operations |
| Reporting reconciliation | Administration & Communications |
| Metric / SLO contract changes | PMO / Engineering |
| Production promotion | Product Authority (separate decision) |

## Related

- How-to: `docs/how-to/operations/run-workflow-health-reconciliation.md`
- Views: `scripts/workflow-health/views.mjs` (#2888)
- Adapters / materializer / SLO: `docs/reference/operations/workflow-health-adapters-and-materializer.md` (#2887)
