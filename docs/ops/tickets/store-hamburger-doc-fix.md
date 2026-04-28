---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: documentation remediation execution scope for Store/hamburger navigation correction
Does Not Own: canonical design authority or implementation code
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-03-26
---

# Store / Hamburger Documentation Correction Ticket

## Objective
Correct active documentation so Store is defined only as a persistent top menu/header button.

## Confirmed current implementation
- Store is a persistent top menu/header button across public and FanClub pages where the relevant header appears.
- Store is present for both logged-in and logged-out users.
- Store is an external Bonfire link only; there is no `/store` route.
- Store is not a hamburger-menu item.
- Any active doc claiming or implying otherwise is drift and must be corrected.

## Required remediation
1. Update active design/governance/as-built docs to define Store only as a persistent top menu/header button.
2. Preserve one authoritative navigation model across the repo.
3. Do not change application code as part of this task.

## Candidate docs to review
- /docs/reference/design/LGFC-Production-Design-and-Standards.md
- /docs/governance/PR_GOVERNANCE.md
- /docs/as-built/cloudflare-frontend.md
- any other active non-archived doc that repeats the outdated hamburger rule

## Exit criteria
- No active documentation includes Store in any responsive navigation item list.
- Active docs agree that Store is a persistent top menu/header button for logged-in and logged-out users.
- Active docs preserve Store as an external Bonfire link only, with no `/store` route.
- Changes are documentation-only.
