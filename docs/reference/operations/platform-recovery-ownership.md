---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Durable ownership map for #2779 platform recovery inventory, restore proofs, Day-2 activation, and Production boundary
Does Not Own: Live restore execution authority, secret values, or paid backup procurement
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2894, #2778
Last Reviewed: 2026-08-03
---

# Platform recovery readiness — Ownership

## Durable owners

| Surface | Owner role | Notes |
| --- | --- | --- |
| Recovery inventory / targets (#2894) | Implementation / Operations with PMO / Engineering for material target changes | Zero-cost baseline; explicit untested status |
| D1 export / isolated restore proofs | Implementation / Operations | Later children; isolated non-Production only |
| B2 / catalog recovery proofs | Implementation / Operations | No Production deletes |
| Source / config / deployment rollback proofs | Implementation / Operations + Day-2 for activation | Immutable candidate identity required |
| Integrated DR exercise | Day-2 Operations coordination + Implementation execution | Requires applicable protected approvals |
| Production recovery activation | Day-2 Operations | First Production use is incident-controlled |
| Credentials, cost, domain, outage decisions | Product Authority | Required before paid products or destructive tests |
| Evidence reconciliation | Administration & Communications | Does not authorize activation |

## Current Development baseline

| Field | Value |
| --- | --- |
| Component branch | `component/platform-recovery-readiness` |
| First task | #2894 |
| Predecessor | #2778 Development accepted 2026-08-03 |
| Production merge | prohibited unless separately authorized |

## Handoff rules

1. Inventory defects route to Implementation / Operations.
2. Material RPO/RTO or architecture changes route to PMO / Engineering.
3. Destructive, credentialed, cost, or outage exercises require Product Authority / Day-2 as applicable.
4. Production Go for the #2778 validation package remains a separate later decision; deferred live credential checks are non-blocking for #2779 Development.
