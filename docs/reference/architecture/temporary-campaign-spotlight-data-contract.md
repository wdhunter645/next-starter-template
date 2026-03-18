
---
Doc Type: Architecture Reference
Audience: Human + AI
Authority Level: Data Contract Authority
Owns: Campaign spotlight data shape, required fields, and leaderboard structure
Does Not Own: Campaign UI design, homepage layout, CI behavior
Canonical Reference: /docs/reference/architecture/temporary-campaign-spotlight-data-contract.md
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

