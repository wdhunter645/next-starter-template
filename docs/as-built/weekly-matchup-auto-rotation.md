---
Doc Type: As-Built
Audience: Human + AI
Authority Level: Supporting
Owns: Runtime behavior for D1-backed weekly photo matchup auto-rotation
Does Not Own: Component design, voting policy, photo curation UI
Canonical Reference: /docs/as-built/weekly-matchup-auto-rotation.md
Related issues: #2157, #2230, #2519
Last Reviewed: 2026-07-15
---

# Weekly Photo Matchup auto-rotation

## Purpose

Records how `GET /api/matchup/current` resolves the homepage Weekly Photo Matchup pair from D1 without requiring manual admin action each week, and how browser image-load failures trigger server repair.

## Scope

- Backend resolver (`functions/api/matchup/current.ts`).
- Browser-driven repair (`POST /api/matchup/repair` via `functions/api/matchup/repair.ts`).
- Public contract consumed by `src/components/WeeklyMatchup.tsx`.
- Photo club-use curation (`photos.is_matchup_eligible`) is defined in `/docs/reference/platform/Backblaze_B2.md`.
- Admin photo curation UI is planned for `/admin/d1-test/` under a future PMO program; until then, inspect-only.

## Behavior

On each request, the API:

1. Computes the current Monday `week_start` (`YYYY-MM-DD`) with a Monday-inclusive expression: `date('now','-6 days','weekday 1')`.
2. For an existing **active** `weekly_matchups` row for that week:
   - both photos must resolve and remain eligible (`is_matchup_eligible >= 0`);
   - both object URLs are probed (HEAD, then ranged GET) before return;
   - if either probe fails, the same repair path as `POST /api/matchup/repair` runs so a missing B2 object is not returned as usable.
3. Otherwise:
   - closes stale active rows from prior weeks;
   - selects two eligible photos from `photos`;
   - prefers non-memorabilia rows;
   - excludes photo IDs used in the last eight matchups when enough alternatives exist;
   - skips rows where `is_matchup_eligible < 0`;
   - inserts/updates an active row for the current week (handles `UNIQUE` race by re-read);
   - clears that week's votes when the photo pair changes mid-week;
   - returns the two-photo payload.
4. Fails closed with `ok: true`, `matchup_id: null`, `items: []` when fewer than two eligible photos exist.

### Proactive B2 ↔ D1 deletion reconciliation

Additive daily sync inserts new B2 keys only. Deletion reconciliation
(`scripts/b2_d1_deletion_reconcile.sh`, after incremental sync in
`.github/workflows/b2-d1-daily-sync.yml`) soft-retires D1 rows whose object keys
are absent from B2: `is_matchup_eligible = -1` plus a `PURGE_ELIGIBLE` rights note.
It fails closed if the B2 inventory is empty. Historical matchup rows keep their
photo IDs; those photos are never reselected for new matchups.

### Broken-image repair (`POST /api/matchup/repair`)

When a homepage matchup `<img>` fires `onError` (defense in depth if a probe or
reconcile has not yet run):

1. The client posts `{ broken_photo_id }` to `/api/matchup/repair` (max two attempts per page load).
2. The server verifies the id is in the active current-week pair.
3. It probes the object URL (HEAD, then ranged GET). Confirmed missing/unreachable objects are marked `is_matchup_eligible = -1` with a `PURGE_ELIGIBLE` rights note.
4. It keeps the healthy photo when possible and selects a replacement for the broken slot (falls back to a full new pair).
5. Pair change clears `weekly_votes` for the week so votes are not transferred.
6. The client replaces the displayed pair and re-syncs the pair-scoped vote lock.

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
