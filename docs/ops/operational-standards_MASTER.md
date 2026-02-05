# Operations — Operational Standards

Status: _MASTER (Operations authoritative)
Last Updated: 2026-02-05

## Purpose
Define the operational standards that keep this repository and deployed website stable over time.

## Standards (non-negotiable)
- Rollback-first during incidents.
- One PR, one intent label.
- Drift gates are guardrails, not suggestions.
- No scope creep: bounded file lists only.
- Evidence-based verification: commands + observed outputs.

## Documentation is infrastructure
- All Day-2 operational truth must live in `_MASTER` documents.
- Chat conversation is not an operational record.

## Security posture (baseline)
- Do not expose secrets in logs or docs.
- Do not weaken auth gating for `/fanclub/**`.
- Treat governance bypass as a security incident.

## Operational cadence
Daily:
- Review active_tasklist.md
- Confirm production health and last deploy status
- Check recent CI failures and address root cause

After any production change:
- Run verification criteria
- Append to deploy log if significant

## Required references
- `/docs/website-process.md` (PR process and runtime policy)
- `/docs/LGFC-Production-Design-and-Standards.md` (design authority)
- `/docs/NAVIGATION-INVARIANTS.md` (navigation authority)
