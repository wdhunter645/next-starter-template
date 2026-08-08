---
Doc Type: Operations Report
Audience: Bill, Work, Cursor, LGFC maintainers, and implementation agents
Authority Level: Controlled
Owns: #2911 idempotent dry-run/backfill tooling design, evidence, and open findings for #2912/#2913
Does Not Own: Production execution, schema changes, cutover decisions, or #2860 acceptance authority
Canonical Reference: /docs/ops/reports/library-content-migration-map-2910.md
Related Issues: #2911, #2910, #2860, #2912, #2913
Last Reviewed: 2026-08-08
---

# Library backfill tooling — design and evidence (#2911)

## Status

**Local-only, non-Production.** `scripts/migrations/library-content-backfill.mjs` never targets `--remote` or `--preview` D1 — only `--local`. There is no flag to override this; Production execution is explicitly #2913's scope, not this task's.

## What was built

- `scripts/migrations/library-content-backfill.mjs` — a two-phase tool (plan, then optionally apply) implementing the #2910 map exactly: deterministic source identity (`tag = legacy-library-{id}`), runtime column-probing for the `is_approved` schema variance, fail-closed exclusion of empty title/content, never-migrate-email, default credit-line fallback, idempotent insert/update/no-op planning, and fail-closed tag-collision detection.
- `tests/library-content-backfill.test.ts` — 27 tests covering the pure planning/mapping logic with fixture data, including a full idempotency proof (`buildPlanForBackfill` run twice against its own simulated output).

## Real end-to-end evidence (not just unit tests)

Beyond the 27 fixture-based unit tests, the tool was run against a real local D1 instance (`wrangler d1 execute lgfc_lite --local`, all 47 repository migrations applied fresh) with seeded `library_entries` rows covering every case in the #2910 map:

1. **Dry-run, first pass** — 5 legacy rows: 3 valid (planned as inserts), 2 excluded (`LE_INVALID_EMPTY` — one empty title, one whitespace-only content). Zero writes made; verified via `SELECT COUNT(*) FROM content_inventory` before and after.
2. **Apply, first pass** — 3 rows inserted. Verified actual row contents: correct tags, correct draft status (see schema-variance finding below), correct credit-line fallback for the row with a blank submitter name, and confirmed no `email` value present anywhere in the written rows.
3. **Apply, second pass (idempotency proof)** — re-ran against the now-migrated state: `insert: 0, update: 0, noop: 3`. Row count unchanged at 3. This is a real rerun against real D1 state, not a simulation.
4. **Collision detection, real case** — manually inserted a `content_inventory` row with `tag = 'legacy-library-6'` and a non-tool `source_name` (simulating an editor's own row that happens to collide with a not-yet-migrated legacy id), then added the corresponding legacy row. Dry-run correctly flagged it as `TAG_COLLISION_NON_MIGRATION_SOURCE` rather than silently overwriting it. Ran `--apply` again and confirmed the editor-owned row's `title`/`credit_line` were completely untouched.

## A real finding surfaced during this build (not fixed here, per #2911's own scope)

Applying all 47 repository migrations fresh, in file order, produces a `library_entries` table **without** the `is_approved` column. This is because migration `0002_library_entries.sql` creates the table first (`CREATE TABLE IF NOT EXISTS`, no `is_approved`), and migration `0004_init_schema.sql`'s own `CREATE TABLE IF NOT EXISTS library_entries` (which does include `is_approved`) is a silent no-op once the table already exists — SQLite's `IF NOT EXISTS` doesn't merge column sets.

This confirms the #2910 map's "Schema variance note" was not a hypothetical caution: **any environment that has run these migrations in file order — which is every environment, since this is the only recorded migration order — likely lacks `is_approved` on `library_entries` today**, meaning legacy approval status may not currently be tracked at all at the schema level. This tool's runtime `PRAGMA table_info` probing handles either case safely (absent column → treat all rows as unapproved/draft, per the map), so it doesn't block this task. But it's worth Production verification: **#2912/#2913 should confirm whether the live Production `library_entries` table actually has `is_approved`** before assuming any approval-based row-class split is meaningful, rather than inheriting this report's local-only finding as fact.

## Interpretation flagged for review: the "missing usable credit" table row

The #2910 map's attribution table includes a row for "`is_approved = 1` but missing usable credit/name → `draft`", but also defines a standing default credit line (`Member library submission (legacy)`) for exactly that case. Under the map's own default-credit rule, every approved row with valid title/content always resolves to a usable `credit_line` (name or default), making the "draft due to missing credit" branch unreachable as currently written. This tool implements the literal default-credit rule (approved + valid → always `published`), and flags this reading explicitly here rather than silently picking an interpretation — if the intent was instead "the anonymous default does not count as sufficient attribution for publish," that's a one-line change to `classifyLegacyRow`'s disposition logic, not a design rework.

## Test evidence

```
npx vitest run tests/library-content-backfill.test.ts
✓ 27 tests passed

npx vitest run   (full suite)
✓ 1012 tests passed, 95 files, 0 regressions

npx tsc --noEmit
✓ clean

npx eslint scripts/migrations/library-content-backfill.mjs tests/library-content-backfill.test.ts
✓ clean

npm run verify:invariants
✓ OK: LGFC critical invariants satisfied (nav/auth surfaces)

git diff --check
✓ clean

Diff against component/library-content-migration: exactly the three allowlisted files
(scripts/migrations/library-content-backfill.mjs, tests/library-content-backfill.test.ts,
docs/ops/reports/library-content-backfill-2911.md)
```

## Explicitly out of scope for this task

- Any write against `--remote`/`--preview`/Production D1.
- Deleting or retiring `library_entries` rows.
- Automatic publication beyond the status computed by the map's own rules.
- A dedicated `migration_source`/`legacy_library_entry_id` schema column — the map notes this as optional/deferrable; this task's writable allowlist doesn't include `migrations/`, so it isn't proposed as a change here, only flagged as a more robust future alternative to the `source_name`-based collision heuristic actually implemented.
- Live Production row-class counts (`GAP_UNMIGRATED_APPROVED` etc.) — explicitly #2912/#2913 evidence, no Production access in this task.

## Review checklist for #2911 acceptance

- [ ] Tag-collision heuristic (source_name-based, since no dedicated marker column exists yet) accepted, or want it strengthened before #2912/#2913 proceed?
- [ ] The "missing usable credit" interpretation above — confirm the literal default-credit reading, or want the stricter reading instead?
- [ ] The `is_approved` schema-variance finding — route to #2912/#2913 for live Production verification (recommended), or handle differently?
- [ ] Decision (Adopt as-is / Adopt with follow-up / Revise) and WORK ACCEPT disposition for #2911.
