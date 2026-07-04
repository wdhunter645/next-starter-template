---
Doc Type: As-Built
Audience: Human + AI
Authority Level: Supporting
Owns: Runtime behavior for D1-backed weekly photo matchup auto-rotation
Does Not Own: Component design, voting policy, photo curation UI
Canonical Reference: /docs/as-built/weekly-matchup-auto-rotation.md
Related issues: #2157
Last Reviewed: 2026-07-04
---

# Weekly Photo Matchup auto-rotation

## Purpose

Records how `GET /api/matchup/current` resolves the homepage Weekly Photo Matchup pair from D1 without requiring manual admin action each week.

## Scope

- Backend resolver only (`functions/api/matchup/current.ts`).
- Public contract consumed by `src/components/WeeklyMatchup.tsx` is unchanged.
- Photo club-use curation (`photos.is_matchup_eligible`) is defined in `/docs/reference/platform/Backblaze_B2.md`.
- Admin photo curation UI is planned for `/admin/d1-test/` under a future PMO program; until then, inspect-only.

## Behavior

On each request, the API:

1. Computes the current Monday `week_start` (`YYYY-MM-DD`).
2. Returns an existing **active** `weekly_matchups` row for that week when both photos resolve and remain eligible.
3. Otherwise:
   - closes stale active rows from prior weeks;
   - selects two eligible photos from `photos`;
   - prefers non-memorabilia rows;
   - excludes photo IDs used in the last eight matchups when enough alternatives exist;
   - skips rows where `is_matchup_eligible < 0`;
   - inserts a new active row for the current week (handles `UNIQUE` race by re-read);
   - returns the two-photo payload.
4. Fails closed with `ok: true`, `matchup_id: null`, `items: []` when fewer than two eligible photos exist.

**Lazy rotation:** the first homepage or API hit of a new week creates the new pair. No separate scheduled rollover job is required.

## Eligibility (interim)

| `is_matchup_eligible` | Meaning | Selection today |
| --- | --- | --- |
| `0` | Default / unreviewed | Temporarily eligible while catalog curation is in progress |
| `1` | Approved club use | Eligible |
| `-1` | Excluded | Never selected |

Target state after admin curation via `/admin/d1-test/`: select only `= 1`.

New and synced rows default to `0` (`NOT NULL DEFAULT 0` in migration `0007_photos_metadata.sql`).

## Vote and results storage

Votes are stored in D1; winner is computed at read time (not persisted as a column).

| Table | Role |
| --- | --- |
| `weekly_votes` | One row per vote: `week_start`, `choice` (`a`/`b`), `source_hash`, `created_at` |
| `weekly_matchups` | Pair metadata: `week_start`, `photo_a_id`, `photo_b_id`, `status` (`active`/`closed`) |

`GET /api/matchup/results` aggregates `weekly_votes` for totals and derives `winner` (`a`, `b`, or `tie`) for the last **closed** week. There is no `winner` column on `weekly_matchups`.

## Related files

- `functions/api/matchup/current.ts` — resolver and selection
- `functions/api/matchup/vote.ts` — vote insert
- `functions/api/matchup/results.ts` — totals and last-week winner
- `src/components/WeeklyMatchup.tsx` — homepage UI
- `tests/matchup-current-rotation.test.ts` — rotation unit tests
- `docs/as-built/weekly-matchup-photo-url-normalization.md` — URL normalization on read paths

## Operator surfaces

| Route | Role |
| --- | --- |
| `/admin/matchup` | Override/emergency: manual create, activate, close; public preview panel |
| `/admin/d1-test` | Inspect `photos` rows (including `is_matchup_eligible`); curation editing deferred to PMO program |

Normal weekly rollover does **not** require `/admin/matchup` action.
