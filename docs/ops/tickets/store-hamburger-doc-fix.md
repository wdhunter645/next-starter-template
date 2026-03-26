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
Correct active documentation that still implies Store belongs in the hamburger menu.

## Confirmed current implementation
- Store is a persistent header button across public and FanClub pages.
- Store is not a required hamburger-menu item.
- Any active doc claiming otherwise is drift and must be corrected.

## Required remediation
1. Update active design/governance/as-built docs that still describe Store as a hamburger requirement.
2. Preserve one authoritative navigation model across the repo.
3. Do not change application code as part of this task.

## Candidate docs to review
- /docs/reference/design/LGFC-Production-Design-and-Standards.md
- /docs/governance/PR_GOVERNANCE.md
- /docs/as-built/cloudflare-frontend.md
- any other active non-archived doc that repeats the outdated hamburger rule

## Exit criteria
- No active documentation claims Store must appear in the hamburger menu.
- Active docs agree that Store is a persistent header button.
- Changes are documentation-only.
