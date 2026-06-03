---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live operating procedures, incident response, monitoring, operator workflows
Does Not Own: Redefining design/architecture/platform specs; historical records
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-06-03
---

# Monitoring Coverage Map (MASTER)

## Purpose
Define what is monitored and identify visibility gaps.

## Monitored
- CI pipeline status
- Deployment success/failure
- Site availability
- CI orchestration phase status
- Repeated CI workflow failures
- Stale queued or in-progress workflow runs
- CI redesign as-built reconciliation status (`docs/reference/ci/lgfc-ci-as-built-reconciliation.md`)
- OPS monitoring ownership and escalation paths (`docs/ops/ci-monitoring-ownership.md`)

## Known Gaps
- Silent data issues
- Partial feature failures
- Expected workflow absence is currently reported as a warning, not a hard block, because some workflows do not run on every merge.
