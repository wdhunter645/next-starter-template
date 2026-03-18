
---
Doc Type: How-To Guide
Audience: Human + AI
Authority Level: Test Authority
Owns: ALS fundraiser campaign spotlight test plan and validation criteria
Does Not Own: Homepage layout rules, campaign data contract, CI behavior
Canonical Reference: /docs/how-to/test/als-fundraiser-spotlight-test-plan.md
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

