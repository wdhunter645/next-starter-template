---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live operating procedures, incident response, monitoring, operator workflows
Does Not Own: Redefining design/architecture/platform specs; historical records
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Related Issues: #1335, #1343
Last Reviewed: 2026-06-05
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
- **Program 1 OPS runtime snapshot** (`docs/ops/reports/program-1-ops-monitoring-snapshot.md`) — trigger class, escalation, verdict matrix for workflows in `ops_runtime_surface.mjs`

## OPS Runtime Coverage (reconciled Task 005)

Authoritative workflow list: `scripts/ci/ops_runtime_surface.mjs` (7 workflows).
Full matrix: `docs/ops/reports/program-1-ops-monitoring-snapshot.md`.

Related OPS workflows **outside** that inventory (documented as gaps, not hidden):

- `assess-nightly.yml` — duplicate schedule overlap with `ops-assess.yml`
- `ops-design-compliance-audit.yml` — alert-only OPS audit; pre-merge counterpart is `design-compliance-warn.yml`

## Known Gaps
- Silent data issues
- Partial feature failures
- Expected workflow absence is currently reported as a warning, not a hard block, because some workflows do not run on every merge.
- Duplicate nightly assessment (`assess-nightly.yml` vs `ops-assess.yml`) — Program 2 `#1058`
- `ops-assess` soft-fail (`continue-on-error`) — Program 2
- Cloudflare Pages retry manual-only — Program 2
- Launch-readiness tests exist; no scheduled CI workflow — Program 2
- Design-compliance audit not in `OPS_RUNTIME_SURFACE` validator — documented in snapshot; Program 2 inventory decision
