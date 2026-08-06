---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Evidence Report
Owns: Member-photo pending/non-public persistence contract and upload rate-limit persistence contract (#3119)
Does Not Own: Implementation of #2899 (intake/quarantine) or #2900 (moderation/detail); UI/UX contracts (see `docs/reference/design/fanclub-subpages.md`)
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-08-06
Related issues: #2857, #2898, #2899, #2900, #3118, #3119
---

# Member-photo persistence and rate-limit schema contract (#3119)

## Objective

Resolve the two open questions #2898/PR #3118 identified so #2899 (secure member
photo intake and quarantine persistence) can implement the schema-dependent
portion of its work without inventing persistence authority:

1. the pending/non-public lifecycle representation for member photo submissions;
2. the deterministic rate-limit persistence model for photo upload attempts.

## Evidence reviewed

- `migrations/0003_photos.sql`, `migrations/0007_photos_metadata.sql` — current
  `photos` schema: `id, url, is_memorabilia, description, created_at, photo_id,
  title, year, era, type, game_context, location, people, teams, tags, source,
  rights_notes, is_featured, is_matchup_eligible`. No status/approval column,
  no submitter identity, no consent/rights-affirmation, no moderation state.
- `functions/api/fanclub/photos.ts` (line 34-35) — explicit as-built comment:
  *"current schema does not have an explicit approval column for photos. We
  treat current rows as already-approved catalog content."* This is the
  authoritative statement of today's implicit behavior that any new `status`
  column must preserve.
- `functions/api/photos.ts` — a second, unauthenticated read endpoint over the
  same `photos` table (noted for #2900: any new `status` filter must be applied
  here too, not only in the member-gated endpoint).
- `migrations/0012_login_attempts.sql`, `functions/api/login.ts` — the repo's
  only existing rate-limit precedent: `login_attempts(ip, email, ok,
  created_at)`, counted via `WHERE ip = ? AND ok = 0 AND created_at >=
  now-1h`, logged on every attempt (success and failure) via a
  best-effort `logAttempt()` that never fails the parent request.
- `migrations/0029_member_sessions.sql`, `migrations/0019_members.sql` —
  member identity is `email` (COLLATE NOCASE) end-to-end; no numeric/opaque
  member id is used in session or auth contexts today.
- `migrations/0037_submission_queue_workflow_delta.sql` — precedent for a
  `status` enum with `CHECK` constraint, reviewer/decision timestamps, and
  purge metadata, but on `submission_queue` (text/library content pipeline),
  built via a destructive rebuild (create-next table, copy, drop, rename) —
  not the pattern used for `photos` itself.
- `functions/_lib/b2.ts`, `functions/api/admin/media-assets/{list,sync-from-b2}.ts`
  — B2 access today is list-only (`listB2Objects`); there is no write/PUT
  helper anywhere in the repo. `media_assets` is a separate B2-ingestion
  cache table, not read by any public/member gallery path.
- `wrangler.toml` and all of `functions/` — no Cloudflare KV binding exists
  anywhere (`kv_namespaces`, `KVNamespace`, `env.KV` all absent).
- `docs/ops/reports/member-photo-reconciliation-2898.md` (PR #3118) — the
  as-built inventory this task resolves the two Unresolved Questions from.

## Decision 1 — pending/non-public persistence model

**Selected: additive extension of the existing `photos` table.**

New nullable/defaulted columns, added via `ALTER TABLE photos ADD COLUMN`
(matching the existing additive pattern in `migrations/0007_photos_metadata.sql`,
not the destructive-rebuild pattern in `migrations/0037_...`):

| Column | Type | Default | Purpose |
|---|---|---|---|
| `status` | TEXT | `'published'` | `'pending' \| 'published' \| 'rejected' \| 'quarantined'`. Enforced at the API layer (see "No CHECK constraints" below). |
| `submitted_by` | TEXT | NULL | Member email of the uploader. NULL for pre-existing/staff-managed rows. |
| `submitted_at` | TEXT | NULL | Submission timestamp. |
| `quarantine_key` | TEXT | NULL | The B2 object key the file was written to at intake time. Preserved permanently for audit/cleanup even after promotion, since `url` may be rewritten on publish. |
| `consent_confirmed` | INTEGER | `0` | 0/1. Member's rights/consent affirmation at submission time. |
| `credit_line` | TEXT | NULL | Attribution text, distinct from the existing freeform `rights_notes`. |
| `rights_owner` | TEXT | NULL | Who holds rights to the image, if stated. |
| `moderation_notes` | TEXT | NULL | Reviewer-facing notes (#2900). |
| `reviewed_by` | TEXT | NULL | Member/admin email who made the moderation decision. |
| `reviewed_at` | TEXT | NULL | Moderation decision timestamp. |

Two supporting indexes: `idx_photos_status`, `idx_photos_submitted_by`.

**Why `DEFAULT 'published'` is correct and non-breaking:** every existing row
in `photos` today is already treated as public catalog content (per the
`functions/api/fanclub/photos.ts` comment quoted above). Filling the new
column with `'published'` on every existing row is not a behavior change —
it is the first time that already-true state becomes an explicit, queryable
value instead of an implicit one. No row's meaning changes.

**Why `url` stays `NOT NULL` and unchanged:** SQLite cannot drop a `NOT NULL`
constraint via `ALTER TABLE` without a full table rebuild, which this
contract deliberately avoids (see rejected alternatives). Instead: while
`status IN ('pending', 'quarantined')`, `url` is populated with the
quarantine object's key/path (not publicly served); `quarantine_key` records
that same key permanently. On promotion to `status = 'published'` (#2900's
responsibility, requires a B2 write/copy capability that does not exist yet),
`url` is rewritten to the promoted public path while `quarantine_key`
continues to point at the original quarantine object for audit/cleanup.

**No `CHECK` constraints on the new `photos` columns.** This matches the
existing `photos` table's own convention — `migrations/0003_photos.sql` and
`0007_photos_metadata.sql` add zero `CHECK` constraints anywhere, including on
`is_memorabilia`, `is_featured`, and `is_matchup_eligible`, all of which are
conceptually boolean-like `INTEGER` columns with no DB-level enforcement.
SQLite's `ALTER TABLE ADD COLUMN` also has narrower `CHECK` support than
`CREATE TABLE`. Valid `status` and `consent_confirmed` values are enforced at
the API layer in #2899/#2900, consistent with how the table already works.

### Rejected alternatives

- **Standalone pending/submissions table** (e.g. `photo_submissions`) —
  rejected. Duplicates most of `photos`' columns, requires a promotion/merge
  step to move a row into `photos` on approval (an extra failure mode with no
  precedent in this codebase), and every existing read path (gallery,
  memorabilia, admin media-assets) would still only query `photos`, so a
  parallel table risks becoming an invisible system nothing reads — the same
  anti-pattern #2898's evidence report flagged for other candidate designs
  this session.
- **Reuse of `submission_queue`** — rejected. That table backs the
  `content_inventory` text/library content pipeline (`title`, `description`,
  `source_name`, `proposed_tag`, `media_reference` as a *reference* to media,
  not a binary image intake target) and its own migration history
  (`0037_submission_queue_workflow_delta.sql`) uses a destructive
  create-copy-drop-rename rebuild whenever its shape changes — a heavier,
  riskier operation than warranted for `photos`, which does not need that
  pattern to add ten nullable columns.
- **KV-based flag for pending state** — rejected. No KV namespace is bound
  anywhere in this repository; this is not an available option, not merely a
  disfavored one.

## Decision 2 — rate-limit persistence model

**Selected: new dedicated table `photo_upload_attempts`**, structurally
mirroring the repo's only existing rate-limit precedent,
`migrations/0012_login_attempts.sql`:

```sql
CREATE TABLE photo_upload_attempts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  member_email TEXT    NOT NULL,
  ip           TEXT    NOT NULL,
  ok           INTEGER NOT NULL,
  created_at   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Indexes: `(member_email, created_at)` and `(ip, created_at)`.

**Keying:** primarily `member_email`, not just `ip`. Login rate-limiting uses
`ip` because login happens pre-authentication; photo upload already requires
an established member session (`requireMember` in
`functions/api/fanclub/photos.ts`), so the authoritative identity is already
known at request time. `ip` is retained as a secondary column for audit and
defense-in-depth (e.g. one compromised/scripted session hitting from many
IPs, or many sessions from one IP), matching `login_attempts`' two-column
shape, but the primary rate-limit query should key on `member_email`.

**Deterministic behavior for #2899:**
- **Logging:** one row per upload attempt (success and failure alike),
  written via a best-effort insert that must never fail the parent request —
  identical pattern to `logAttempt()` in `functions/api/login.ts`.
- **Window/count:** `WHERE member_email = ? AND ok = 0 AND datetime(created_at)
  >= datetime('now', '-1 hour')`, mirroring `login_attempts`' exact query
  shape (proven correct in `tests/member-photo-schema-contract.test.ts`).
  The specific threshold (max attempts per window) is a product/API-layer
  constant for #2899 to define, not a schema concern.
- **Retry:** on a rate-limit rejection, the client retries after the window
  rolls forward; no separate expiry/TTL column is needed because the window
  is computed at query time from `created_at`, identical to `login_attempts`.
- **Cleanup:** out of scope for this contract and for #2899. The table grows
  unboundedly the same way `login_attempts` already does today (no purge job
  exists for it either) — this is an existing accepted pattern in this repo,
  not a new gap introduced here. Flagged as a candidate follow-up (shared
  with `login_attempts`) for ops, not a blocker for #2899/#2900.
- **Privacy-safe audit:** no request body, file content, or filename is
  logged — only `member_email`, `ip`, `ok`, `created_at`, matching
  `login_attempts`' existing privacy posture.

### Rejected alternative

- **KV-based counters** — rejected for the same reason as Decision 1: no KV
  namespace exists in this repository.

## Preservation of existing gallery behavior

Confirmed via `tests/member-photo-schema-contract.test.ts`: a row inserted
with the pre-#3119 column set (no `status` supplied) receives
`status = 'published'` and `consent_confirmed = 0` automatically. No existing
query needs to change to keep working; `functions/api/fanclub/photos.ts` and
`functions/api/photos.ts` continue to return every current row unchanged
until #2900 adds an explicit `WHERE status = 'published'` filter (required
so that pending/#2899-submitted rows do **not** leak into the public/member
gallery before moderation — currently, since those endpoints select all rows
unconditionally, this filter is a required part of #2899's or #2900's
schema-dependent work, not optional).

## Rollback and backward compatibility

- **Rollback:** every statement in
  `migrations/0045_member_photo_pending_status_and_rate_limit.sql` is
  additive (`ADD COLUMN`, `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT
  EXISTS`). Rollback is: stop writing to the new columns/table; optionally
  `DROP TABLE photo_upload_attempts` and leave the ten new `photos` columns
  unused (SQLite cannot cheaply `DROP COLUMN` without a rebuild, but unused
  nullable/defaulted columns are inert and harmless — the same posture
  `is_featured`/`is_matchup_eligible` already have relative to older code
  that predates them).
- **Backward compatibility:** verified — no existing row's `status` or
  `consent_confirmed` value differs from today's actual implicit behavior;
  no existing query breaks; no existing column is renamed, retyped, or
  dropped.
- **Production mutation:** none performed. This task only adds the migration
  file; it does not run it against any live/Production database.

## Exact implications for #2899 (schema-dependent increment)

- Insert new member submissions into `photos` with: `status = 'pending'`,
  `submitted_by = <member email>`, `submitted_at = now`, `quarantine_key =
  <B2 quarantine object key>`, `url = <same quarantine key/path>`,
  `consent_confirmed` per the member's affirmation, `credit_line` if supplied.
- Log every upload attempt (success and failure) into `photo_upload_attempts`
  with `member_email`, `ip`, `ok`.
- Rate-limit check before processing: count `photo_upload_attempts` rows for
  the current `member_email` with `ok = 0` in the trailing 1-hour window
  (exact query in the Decision 2 section above); reject with a deterministic
  429-style error when the threshold is exceeded (threshold value is #2899's
  to set).
- Do **not** add a `status = 'published'` filter to any read endpoint —
  that is #2900's responsibility once moderation exists (added here only to
  keep #2899's scope to intake, matching its non-blocking execution rule).

## Exact implications for #2900 (moderation/detail)

- Add `WHERE status = 'published'` (or equivalent) to both
  `functions/api/fanclub/photos.ts` and `functions/api/photos.ts` so
  pending/rejected/quarantined rows do not appear in public/member listings.
- Moderation transition (`pending` → `published`/`rejected`) sets
  `reviewed_by`, `reviewed_at`, `moderation_notes`; a `published` transition
  additionally requires copying/promoting the object from the quarantine B2
  key to a public key and rewriting `url` — this requires a B2 write
  capability that does not exist yet (`functions/_lib/b2.ts` is list-only
  today); flagged here as a dependency #2900 will need to satisfy, not
  something this contract can resolve.
- Photo detail view (new "Photo Detail" section added to
  `docs/reference/design/fanclub-subpages.md` by #2898/#3118) can now read
  `credit_line`, `rights_owner`, and `submitted_by` for attribution display.

## `docs/reference/design/fanclub-subpages.md` — not touched, deliberately

This file is in this task's writable allowlist, but it is also one of PR
#3118's two changed files, and #3118 has not merged yet. Per this task's own
Starting SHA instruction ("until then, use PR #3118 head as read-only
evidence and do not collide with its two-file diff"), no edit was made here.
The attribution fields this contract adds (`credit_line`, `rights_owner`,
`submitted_by`) are additive to the "Photo Detail" section #3118 is already
introducing; #2900 (or a rebase of this task) can incorporate them once
#3118 merges, without any conflict risk from a concurrent edit here.

## Changed paths

- `migrations/0045_member_photo_pending_status_and_rate_limit.sql` (new)
- `tests/member-photo-schema-contract.test.ts` (new)
- `docs/ops/reports/member-photo-schema-contract-3119.md` (new, this file)

## Validation performed

- `npx vitest run tests/member-photo-schema-contract.test.ts` — 5/5 passed
  (columns present; legacy-shaped row defaults to `published`; pending row
  with quarantine metadata accepted; `photo_upload_attempts` shape correct;
  1-hour rate-limit window count query correct).
- `scripts/ci/docs_check_headers.sh` (scoped to this task's changed docs).
- `scripts/ci/diataxis_folder_audit.mjs`.
- `git diff --check` (no whitespace errors).
