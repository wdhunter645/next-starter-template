---
Doc Type: Architecture Reference
Audience: Human + AI
Authority Level: Controlled
Owns: ALS fundraiser leaderboard ingest and ranking data contract
Does Not Own: Campaign spotlight UI layout; fundraiser winner policy; publishing procedure
Canonical Reference: /docs/reference/design/als-fundraiser-2026-campaign-spotlight.md
Last Reviewed: 2026-05-05
---

# Fundraiser Leaderboard Data Contract

## Definition

The fundraiser leaderboard data contract defines the launch-safe manual JSON source and normalized application shape for the ALS Fundraiser 2026 leaderboard.

## Source File

`/data/fundraiser.json`

The source is an array of records.

## Source Record

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `team_id` | string | yes | Must be a non-empty string after trimming. |
| `team_name` | string | yes | Must be a non-empty string after trimming. |
| `total_amount` | number or numeric string | yes | Must be finite and greater than or equal to zero. |
| `donor_count` | number or numeric string | yes | Must be a finite integer greater than or equal to zero. |
| `timestamp` | string | yes | Must parse as a valid timestamp. |

## Normalized Record

The application exposes normalized records from `/src/lib/fundraiser.ts`.

| Field | Type | Source |
| --- | --- | --- |
| `teamId` | string | `team_id` |
| `teamName` | string | `team_name` |
| `totalAmount` | number | normalized `total_amount` |
| `donorCount` | number | normalized `donor_count` |
| `points` | number | `totalAmount * donorCount` |
| `timestamp` | string | `timestamp` |

## Ranking Order

Leaderboard sorting uses this order:

1. Higher `points`.
2. Higher `donorCount`.
3. Higher `totalAmount`.
4. Stable source order for any remaining tie.

## Exports

`/src/lib/fundraiser.ts` exports:

- `normalizeFundraiserRecords(records)`
- `sortFundraiserLeaderboard(teams)`
- `getFundraiserTeams()`
- `fundraiserTeams`

## Validation Coverage

`/tests/fundraiser.test.ts` covers:

- seed data loading
- numeric string normalization
- point calculation
- leaderboard sorting
- stable remaining ties
- malformed record rejection

## Relationship to Campaign Spotlight

This contract defines the leaderboard data layer completed for T20-B and T20-C. The campaign spotlight UI remains governed by:

- `/docs/reference/design/home-temporary-campaign-section.md`
- `/docs/reference/design/als-fundraiser-2026-campaign-spotlight.md`
