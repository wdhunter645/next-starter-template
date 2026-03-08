---
Doc Type: Reference
Audience: Human + AI
Authority Level: Technical Reference
Owns: Data contract for campaign spotlight payload and snapshot sourcing rules
Does Not Own: UI layout; fundraising rules; analytics strategy
Canonical Reference: /docs/reference/design/home-temporary-campaign-section.md
Last Reviewed: 2026-02-26T13:14:02Z
---

# Temporary Campaign Spotlight — Data Contract (Reference)

## Design Goal
Home must not compute drifting standings live.
Home displays **published snapshots**.

## Required Fields (Public Data Mode)
At minimum, a published snapshot must provide:
- asOfEt (timestamp)
- leaders:
  - grandPrizeMostPoints
  - categoryMostSupporters
  - categoryMostFunds
- top lists (optional): overall, teams, individuals

## Privacy Constraint
No donor PII is stored.
Donor metric uses “Supporters” counts from Givebutter in public data mode.

## Fail-Closed Behavior
If no published snapshot exists:
- spotlight must either render “info only” OR render nothing (config-driven).
- it must never render stale or partially computed standings.
