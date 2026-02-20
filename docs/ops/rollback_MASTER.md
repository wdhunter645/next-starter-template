---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live operating procedures, incident response, monitoring, operator workflows
Does Not Own: Redefining design/architecture/platform specs; historical records
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-02-20
---

# Rollback Playbook (MASTER)

## Purpose
Provide steps and decision rules for restoring stability after a failed deploy or outage.

## When to Rollback
Rollback if:
- Production is broken
- Core feature unavailable
- Data integrity at risk

## Rollback Strategy
Preferred order:
1) Revert last PR
2) Redeploy last known good state
3) Restore prior configuration

## Targets
Code, CI workflows, Cloudflare deploy state, and D1 schema (only with safe migrations).
