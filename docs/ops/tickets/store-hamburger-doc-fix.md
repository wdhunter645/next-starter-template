---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: documentation remediation execution scope for Store/hamburger navigation correction
Does Not Own: canonical design authority or implementation code
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-03-26
---

# Hamburger Drawer Documentation Correction Ticket

## Objective
Correct active documentation so hamburger drawer membership is defined as About and Contact only, and Store is defined only as a persistent top menu/header button.

## Confirmed current design
- Hamburger drawer items are exactly:
  - About → `/about`
  - Contact → `/contact`
- Hamburger drawer items do not include Store, Support, Admin, Members, Home, Join, Login, Logout, Club Home, My Profile, or Search.
- Store is a persistent top menu/header button across public and FanClub pages where the relevant header appears.
- Store is present for both logged-in and logged-out users.
- Store is an external Bonfire link only; there is no `/store` route.
- Support is consolidated into Contact and is not a hamburger drawer item.
- Admin access is not exposed as a hamburger drawer item.
- Any active doc claiming or implying otherwise is drift and must be corrected.

## Required remediation
1. Update active design/governance/as-built docs to define hamburger drawer membership as About and Contact only.
2. Preserve one authoritative navigation model across the repo.
3. Do not change application code as part of this task.

## Candidate docs to review
- /docs/reference/design/LGFC-Production-Design-and-Standards.md
- /docs/governance/PR_GOVERNANCE.md
- /docs/as-built/cloudflare-frontend.md
- /docs/reference/design/locks/header-memberheader-logo-banner-design-lock.md
- /docs/governance/PR_PROCESS.md if stale assessment or hamburger rules are present
- any other active non-archived doc that repeats outdated hamburger drawer membership

## Exit criteria
- Active documentation defines hamburger drawer membership as About and Contact only.
- No active documentation includes Store, Support, Admin, Members, Home, Join, Login, Logout, Club Home, My Profile, or Search in any hamburger drawer item list.
- Active docs agree that Store is a persistent top menu/header button for logged-in and logged-out users.
- Active docs preserve Store as an external Bonfire link only, with no `/store` route.
- Active docs state Support is consolidated into Contact and Admin is not exposed through the hamburger drawer.
- Changes are documentation-only.
