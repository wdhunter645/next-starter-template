
---
Doc Type: Data Contract
Audience: Human + AI
Authority Level: Architecture Reference
Owns: Campaign spotlight data structure, required fields, and snapshot rules
Does Not Own: UI layout; campaign schedule; fundraiser policies
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-08
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

