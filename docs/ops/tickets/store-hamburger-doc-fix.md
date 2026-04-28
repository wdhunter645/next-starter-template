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
Correct active documentation so desktop/tablet navigation uses visible top-menu buttons and mobile navigation uses the hamburger drawer because mobile has no visible top menu.

## Confirmed current design
- Desktop/tablet public logged-out top menu: Join, Search, Store, Login.
- Desktop/tablet public logged-in top menu: Club Home, Search, Store, Logout.
- Desktop/tablet FanClub top menu: Club Home, My Profile, Search, Store, Logout.
- Mobile has no visible top menu.
- Mobile public logged-out hamburger: Join, Search, Store, Login, About, Contact.
- Mobile public logged-in hamburger: Club Home, Search, Store, Logout, About, Contact.
- Mobile FanClub hamburger: Club Home, My Profile, Search, Store, Logout, About, Contact.
- Store is a persistent top menu/header button on desktop/tablet and a mobile hamburger item because mobile has no visible top menu.
- Store is an external Bonfire link only; there is no `/store` route.
- Support is consolidated into Contact and is not a hamburger item.
- Admin access is not exposed as a hamburger item.
- Members and Home are not exposed as separate hamburger labels.
- Any active doc claiming or implying otherwise is drift and must be corrected.

## Required remediation
1. Update active design/governance/as-built docs to distinguish desktop/tablet top-menu behavior from mobile hamburger behavior.
2. Preserve one authoritative navigation model across the repo.
3. Do not change application code as part of this task.

## Candidate docs to review
- /docs/reference/design/LGFC-Production-Design-and-Standards.md
- /docs/governance/PR_GOVERNANCE.md
- /docs/as-built/cloudflare-frontend.md
- /docs/reference/design/locks/header-memberheader-logo-banner-design-lock.md
- /docs/governance/PR_PROCESS.md if stale assessment or hamburger rules are present
- any other active non-archived doc that repeats outdated responsive navigation membership

## Exit criteria
- Active documentation defines desktop/tablet top menus separately from mobile hamburger drawers.
- Active documentation states mobile has no visible top menu.
- Active documentation defines mobile hamburger drawers as the relevant navigation buttons plus About and Contact.
- Active docs agree that Store is a desktop/tablet top menu/header button and a mobile hamburger item because mobile has no visible top menu.
- Active docs preserve Store as an external Bonfire link only, with no `/store` route.
- Active docs state Support is consolidated into Contact, Admin is not exposed through the hamburger drawer, and Members/Home are not separate hamburger labels.
- Changes are documentation-only.
