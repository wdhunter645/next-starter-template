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
