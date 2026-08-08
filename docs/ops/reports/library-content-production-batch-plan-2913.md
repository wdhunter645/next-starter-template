---
Doc Type: Operations Report
Audience: Bill, Work, Cursor, LGFC maintainers, and implementation agents
Authority Level: Controlled
Owns: #2913 Production batch-execution plan and post-migration verification runbook (non-Production preparation only)
Does Not Own: Production execution, #2911 tooling changes, #2912 verification evidence, or #2860 acceptance authority
Canonical Reference: /docs/ops/reports/library-content-migration-map-2910.md
Related Issues: #2913, #2912, #2911, #2910, #2860
Last Reviewed: 2026-08-08
---

# Library-content Production batch-execution plan (#2913)

## Status

**Package preparation only. No Production access, read or write, was performed or attempted in this task.**

This sandbox has no Cloudflare authentication configured (`npx wrangler whoami` returns "You are not authenticated"), so there is no technical path from this session to Production D1, independent of authorization. This document is the non-Production deliverable #2913 needs staged before a human/ops operator with real Production credentials executes the required preflight and, separately, before Product Authority grants Production Go.

## Blocking preflight — not resolved by this task

`docs/ops/reports/library-content-backfill-2911.md` found that replaying all 47 repository migrations locally leaves `library_entries` **without** an `is_approved` column (migration `0004_init_schema.sql`'s `CREATE TABLE IF NOT EXISTS` is a silent no-op once `0002_library_entries.sql` already created the table). This is a local-replay finding, not confirmation of live Production's actual schema.

**Required before any batch executes** (per #2913's own routed instruction from #2911):

```sql
-- Read-only. Run against Production D1 by an operator with real credentials.
PRAGMA table_info(library_entries);
```

- If `is_approved` is **absent**, every legacy row must be treated as unapproved/draft-only per the #2910 map's own rule — record this and proceed with all rows as drafts.
- If `is_approved` is **present**, record its actual value distribution (counts only, no row content) so the `LE_APPROVED`/`LE_UNAPPROVED` split used in pre/post batch evidence is accurate rather than assumed:

```sql
-- Read-only, counts only, no row content.
SELECT COUNT(*) AS le_approved FROM library_entries WHERE is_approved = 1;
SELECT COUNT(*) AS le_unapproved FROM library_entries WHERE is_approved != 1 OR is_approved IS NULL;
```

This is a factual verification step, not a judgment call, and this task does not resolve it — it is restated here as the first checklist item below so it is not lost between #2913's issue body and this plan.

## Batch sizing and sequencing strategy

#2912 proved directly against the real `functions/api/fanclub/library.ts` handler that the dual-read cutover is **section-level, not per-row**: the moment any published `content_inventory` row exists for the `library` section, the legacy `library_entries` fallback stops being consulted entirely — including for legacy rows not yet migrated. See `docs/ops/reports/library-content-recovery-verification-2912.md` for the evidence.

Operational consequence for batching:

- **Do not** publish a partial batch that leaves some legacy rows migrated-and-published and others not-yet-migrated in the same visible set — that combination hides the not-yet-migrated remainder for the duration of the batch window, which is a real (if temporary) content-visibility regression for members.
- Two acceptable batch shapes:
  1. **All-drafts-first:** migrate every legacy row as `draft` (matches the likely `is_approved`-absent case above) in one or more batches, verify counts, then flip to `published` only once the full set is migrated and reviewed — no partial-visibility window at all, since drafts never trigger the cutover.
  2. **Complete-then-publish, per class:** if some rows are already known-approved and intended to publish immediately, migrate and publish that whole class in a single batch rather than row-by-row, so the legacy fallback for that class is retired atomically instead of leaving stragglers invisible.
- Batch size itself is not schema- or performance-constrained by anything found in #2910/#2911/#2912 — #2911's tool processes the full legacy set in one pass locally. The constraint above is about **visibility ordering**, not row-count throughput.

## Pre/post count evidence (redacted, no PII, no content)

Run before and after each batch, exactly as #2911's local evidence did:

```sql
-- Before
SELECT COUNT(*) AS legacy_total FROM library_entries;
SELECT COUNT(*) AS already_migrated FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';

-- After
SELECT COUNT(*) AS legacy_total FROM library_entries;               -- must be unchanged (no deletes in this project)
SELECT COUNT(*) AS migrated_now FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';
SELECT COUNT(*) AS published_now FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%' AND status = 'published';
```

Record only these aggregate counts in batch evidence — never individual row titles, names, or emails, consistent with #2911's and #2912's privacy-safe evidence pattern.

## Rollback — delegates to #2912's proven runbook

This plan does not redefine recovery. Use the exact three-step sequence already proven end-to-end (real local-D1 backfill → revert → re-backfill cycle) in `docs/ops/reports/library-content-recovery-verification-2912.md` — the count confirmations before and after are part of that proven sequence, not optional:

```sql
-- 1. Confirm current legacy-tagged canonical row count before acting.
SELECT COUNT(*) AS n FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';

-- 2. Revert: removes only canonical rows under the migration's own tag prefix.
DELETE FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';

-- 3. Confirm the count is now zero (or matches the intended partial-revert scope).
SELECT COUNT(*) AS n FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';
```

Scope the `DELETE` and both `SELECT`s to a single id (`tag = 'legacy-library-{id}'`) for a partial revert, or leave the `LIKE` prefix form for a complete revert of this migration's rows. Non-legacy `content_inventory` rows are never touched by this statement (proven in #2912). Any Production use of this sequence requires the same separate Production authorization as the forward batch itself, plus a confirmed backup per #2860's stop conditions.

## Post-migration verification checklist (for after a Production batch, once authorized and executed)

- [ ] Pre/post counts recorded (above) and match expected batch size.
- [ ] `library_entries` row count unchanged (no deletes performed by this migration).
- [ ] Member-facing `/api/fanclub/library` list, search, and detail behavior spot-checked against the accepted canonical path — no regression in visible titles versus the pre-batch legacy-only view for any not-yet-migrated class.
- [ ] No `email` value present in any migrated `content_inventory` row (spot-check, not full scan, to avoid unnecessary PII handling).
- [ ] Every published row has a non-empty `source_name` and `credit_line` (schema triggers already enforce this at the D1 level, per `migrations/0036_content_inventory_schema_delta.sql`, but confirm no trigger was bypassed).
- [ ] Legacy retirement/retention disposition recorded explicitly (#2860 requires this be an explicit decision, not a default) — this plan does not recommend retirement timing; that is a separate Product Authority decision after Production verification.

## Explicitly out of scope for this task

- Any Production read or write, including the `PRAGMA table_info` preflight itself — requires an operator with real Production D1 credentials, not available in this session.
- Any modification to `scripts/migrations/library-content-backfill.mjs` (remains intentionally local-only, no override flag, per #2911).
- The `is_approved` schema-variance question's actual answer — recorded as unresolved, not assumed.
- Legacy retirement timing or execution.

## Review checklist

- [ ] Batch sizing/sequencing strategy (all-drafts-first vs. complete-then-publish-per-class) — accepted, or want a different approach?
- [ ] Pre/post count queries and post-migration verification checklist — accepted as the runbook, or want additions?
- [ ] Who executes the live `PRAGMA table_info(library_entries)` preflight, and when — this task cannot perform it.
- [ ] Production Go decision remains separately gated per #2860's stop conditions; not requested or assumed by this document.
