
---
Doc Type: Reference
Audience: Internal
Authority Level: Supporting
Owns: Snapshot publishing procedure and cadence for ALS Fundraiser
Does Not Own: Campaign data contract, leaderboard calculation logic
Canonical Reference: docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-18
---

# Snapshot Publishing Procedure

Last Updated: 2026-03-08

## Snapshot Cadence

May 1 – May 25
12 hour updates

May 26 – June 2
Hourly updates

June 3
Final standings snapshot

## Publish Conditions

Snapshots publish only if:

- data fetch successful
- standings calculation verified
- duplicate winner checks passed
- timestamp recorded

If validation fails → snapshot not published.

## Final Lock

On June 3:

1. Confirm fundraiser closed
2. Generate final snapshot
3. Run tie checks
4. Publish final standings
5. Archive snapshot for audit

