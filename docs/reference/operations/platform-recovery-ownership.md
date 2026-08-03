---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Durable ownership map for #2779 platform recovery inventory, restore proofs, Day-2 activation, and Production boundary
Does Not Own: Live restore execution authority, secret values, or paid backup procurement
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2894, #2895, #2896, #2778
Last Reviewed: 2026-08-03
---

# Platform recovery readiness — Ownership

## Durable owners

| Surface | Owner role | Notes |
| --- | --- | --- |
| Recovery inventory / targets (#2894) | Implementation / Operations with PMO / Engineering for material target changes | Zero-cost baseline; explicit untested status where applicable |
| D1 export / isolated restore proofs (#2895) | Implementation / Operations | Synthetic isolated proof complete; live CF D1 deferred |
| B2 / catalog recovery proofs (#2895) | Implementation / Operations | Synthetic catalog reconcile complete; no Production deletes; live list deferred |
| Source / config / deployment rollback proofs (#2896) | Implementation / Operations + Day-2 for activation | Immutable candidate + tabletop rollback proven; live Pages rollback deferred |
| Integrated DR exercise (#2896) | Implementation / Operations (synthetic) + Day-2 for live coordination | Bounded synthetic scenario complete; no Production outage |
| Production recovery activation | Day-2 Operations | First Production use is incident-controlled (#2897 / Day-2) |
| Credentials, cost, domain, outage decisions | Product Authority | Required before paid products or destructive tests |
| Evidence reconciliation | Administration & Communications | Does not authorize activation |

## Current Development baseline

| Field | Value |
| --- | --- |
| Component branch | `component/platform-recovery-readiness` |
| Current task | #2896 (after #2895 D1/B2 isolation) |
| Predecessor | #2778 Development accepted 2026-08-03; #2894/#2895 closed |
| Production merge | prohibited unless separately authorized |

## Handoff rules

1. Inventory defects route to Implementation / Operations.
2. Material RPO/RTO or architecture changes route to PMO / Engineering.
3. Destructive, credentialed, cost, or outage exercises require Product Authority / Day-2 as applicable.
4. Production Go for the #2778 validation package remains a separate later decision; deferred live credential checks are non-blocking for #2779 Development.
