---
Doc Type: Reference
Audience: Internal
Authority Level: Supporting
Owns: Campaign spotlight test coverage and verification steps
Does Not Own: Homepage layout tests, deployment verification
Canonical Reference: docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-18
---
# Campaign Spotlight Test Plan

Last Updated: 2026-03-08

## Layout Tests

Verify:

- section renders between Hero and Weekly Matchup
- section spacing matches design system
- fonts consistent with homepage styles

## Fail Closed Tests

If API fails → section does not render.

## Leaderboard Tests

Validate:

points = funds × supporters

Winner logic:

- no duplicate winners
- correct removal order

## Admin Preview Tests

Verify /admin/fundraiser-preview renders section correctly.

