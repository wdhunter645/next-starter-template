---
Doc Type: Operations Report
Audience: Bill, Work, Cursor, LGFC maintainers, and implementation agents
Authority Level: Controlled
Owns: #2912 mixed-version and isolated-recovery verification evidence and the exact recovery operator sequence for #2913
Does Not Own: Production execution, #2911 tooling changes, or #2860 acceptance authority
Canonical Reference: /docs/ops/reports/library-content-migration-map-2910.md
Related Issues: #2912, #2911, #2910, #2860, #2913
Last Reviewed: 2026-08-08
---

# Library mixed-version and recovery verification (#2912)

## Status

**Verification-only, non-Production.** No Production execution, no legacy cleanup, no schema mutation, and no modification of #2911's `scripts/migrations/library-content-backfill.mjs` (used read-only, as a dependency, per this task's non-goals).

## What was built

- `tests/library-content-mixed-version.test.ts` — 9 tests exercising the **real application handler** (`functions/api/fanclub/library.ts`, via the actual `onRequestGet` export, not a reimplementation) against empty, malformed, legacy-only, canonical-only, and mixed legacy/canonical states.
- `tests/library-content-recovery.test.ts` — 7 tests proving an isolated tag-prefix revert operation (`DELETE FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%'`) is safe, idempotent, and leaves non-legacy inventory untouched, plus a full backfill → revert → re-backfill cycle proof using #2911's real `buildPlanForBackfill`.

## Key finding: dual-read cutover is section-level, not per-row

Confirmed directly against the real `library.ts` handler (not assumed): as soon as **any** published `content_inventory` row is eligible for the `library` section, the legacy `library_entries` fallback stops being consulted **entirely** — including for legacy rows that haven't been migrated yet. This matches the #2910 map's documented "Preserved fallback contract" exactly, but it has an operational implication worth stating plainly for #2913's batch planning: **a partial migration batch that publishes even one row will temporarily hide every not-yet-migrated legacy story**, not just the ones already migrated. Batches should be planned with this in mind — either migrate a class to completion before any row in it is allowed to publish, or accept a temporary visibility gap for the remainder of that class during the batch window.

Also confirmed: a `content_inventory` row carrying a `legacy-library-*` tag while still in `draft` status (e.g., mid-migration) does **not** trigger the cutover — `countPublishedInventoryForSection` correctly excludes it, and the legacy fallback remains authoritative until publish. This is the expected "duplicate/in-progress" state and behaves correctly.

## Real end-to-end recovery evidence (local D1, not just simulated)

Beyond the 16 committed unit/integration tests, a real local D1 instance (all 47 migrations applied fresh) was used to prove the full cycle:

1. Seeded 3 legacy rows plus 1 unrelated, non-legacy `content_inventory` row (`club-newspaper-feature-1`, an editorial feature) to prove isolation.
2. Ran #2911's `--apply` for real: 3 rows inserted (`legacy-library-1/2/3`), non-legacy row untouched.
3. Executed the exact recovery statement: `DELETE FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';` — verified all 3 legacy-migrated rows removed, the non-legacy editorial row (id 1) **still present, untouched**.
4. Re-ran #2911's `--apply` against the now-reverted state: 3 fresh inserts, `update: 0` — identical shape to the original first run, proving the revert left no residue that would change future migration behavior (isolated restore proof).

## Exact recovery operator sequence

For an operator who needs to revert a library-content migration batch (non-Production or, once #2913 authorizes it, Production):

```sql
-- 1. Confirm current legacy-tagged canonical row count before acting.
SELECT COUNT(*) AS n FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';

-- 2. Revert: removes only canonical rows under the migration's own tag prefix.
--    Non-legacy inventory (any other tag) is never touched by this statement.
DELETE FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';

-- 3. Confirm the count is now zero (or matches the intended partial-revert scope,
--    if reverting a single id: WHERE tag = 'legacy-library-{id}' instead of the LIKE form).
SELECT COUNT(*) AS n FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';
```

```bash
# Via wrangler (local):
npx wrangler d1 execute lgfc_lite --local --command "DELETE FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';"

# Re-run the #2911 tool to re-migrate from the (untouched) library_entries source of truth:
node scripts/migrations/library-content-backfill.mjs --apply
```

This sequence is **local-only** as written. Any Production use requires #2913's own protected authorization, backup confirmation, and `--remote`-equivalent execution path — not authorized by this task.

## Test evidence

```
npx vitest run tests/library-content-mixed-version.test.ts tests/library-content-recovery.test.ts
✓ 16 tests passed (9 + 7)

npx vitest run   (full suite)
✓ 1040 tests passed, 98 files, 0 regressions

npx tsc --noEmit
✓ clean

npx eslint tests/library-content-mixed-version.test.ts tests/library-content-recovery.test.ts
✓ clean

npm run verify:invariants
✓ OK: LGFC critical invariants satisfied (nav/auth surfaces)

Real local-D1 backfill -> revert -> re-backfill cycle: verified, non-legacy row survived untouched
throughout, re-applied migration was byte-for-byte identical in shape to the original first run.
```

## Explicitly out of scope for this task

- Any Production execution or write.
- Any modification to `scripts/migrations/library-content-backfill.mjs` (used read-only).
- Legacy `library_entries` cleanup or retirement.
- The two #2911 findings already routed elsewhere (`is_approved` schema variance → #2913 preflight; attribution-table interpretation → Bill's decision, still pending) — not re-litigated here.

## Review checklist

- [ ] Section-level (not per-row) cutover finding — accepted as documented operational guidance for #2913's batch planning?
- [ ] Recovery operator sequence — accepted as the runbook for #2913, or want additional steps (e.g., an explicit backup-before-delete step) added?
- [ ] Decision (Adopt as-is / Adopt with follow-up / Revise) and WORK ACCEPT disposition for #2912.
