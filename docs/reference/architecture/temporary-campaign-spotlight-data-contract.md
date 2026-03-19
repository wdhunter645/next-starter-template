---
Doc Type: Reference
Audience: Internal
Authority Level: Supporting
Owns: Campaign spotlight data structure and required field definitions
Does Not Own: Data fetching implementation, snapshot publishing infrastructure
Canonical Reference: docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-18
---
# Campaign Spotlight Data Contract

Last Updated: 2026-03-08

## Data Source

GiveButter public campaign API or exported data snapshots.

## Required Fields

- campaignTitle
- campaignStart
- campaignEnd
- fundsRaised
- supporters
- leaderboard[]

Leaderboard entry structure:

{
  "name": "",
  "type": "individual|team",
  "funds": number,
  "supporters": number,
  "points": number
}

## Snapshot Rule

Homepage must render **published snapshots only**.

Admin dashboard generates and validates snapshots before publishing.

