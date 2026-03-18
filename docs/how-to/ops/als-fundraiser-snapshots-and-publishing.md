
---
Doc Type: How-To Guide
Audience: Human + AI
Authority Level: Operational Procedure
Owns: Snapshot publishing schedule and publish conditions for ALS fundraiser
Does Not Own: Campaign data contract, homepage layout, CI behavior
Canonical Reference: /docs/how-to/ops/als-fundraiser-snapshots-and-publishing.md
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

