---
Doc Type: Operations
Audience: Bill, ChatGPT / Atlas, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2898 as-built route/API/schema/B2/moderation/test inventory, preserved-vs-gap analysis, rights/privacy/visibility map, and exact implementation allowlists for #2899/#2900 under Project #2857
Does Not Own: Runtime implementation (owned by #2899/#2900/#2901), Product/legal rights decisions, or Bill's final Phase acceptance
Canonical Reference: /docs/reference/design/fanclub-subpages.md
Related Issues: #2857, #2858, #2859, #2860, #2898, #2899, #2900, #2901, #2784
Last Reviewed: 2026-08-06
---

# Member Photo Intake and Photo-Detail Experience — Reconciliation (#2898)

## Purpose

Reconcile the current as-built member photo experience against #2857's approved contract (authenticated member photo upload with moderation, and an accessible photo-detail experience) so #2899–#2901 can execute from verified repository evidence rather than rediscovering scope.

## Scope

In scope: the full route/component/API/schema/B2/moderation/test inventory for member-facing photo surfaces; what #2857 requires versus what exists today; the ownership/privacy/rights/retention/visibility gap; exact proposed file allowlists for #2899 (intake) and #2900 (moderation + detail UX); failure-safe/rollback boundaries; and unresolved Product/rights questions.

Out of scope: any runtime implementation, schema migration, B2 write, or Production action. This is a read-only evidence task.

## Current known truth

### Route/component/API/schema inventory

| Surface | Path | Verified role |
| --- | --- | --- |
| Gallery page | `src/app/fanclub/photo/page.tsx` | Member-session-gated (`useMemberSession`), read-only grid; search + tag filters; "Submit a Photo" links to `/fanclub/submit` |
| Submission page | `src/app/fanclub/submit/page.tsx` | **Text-article** form (title/content/rights fields per #2919) — no file input; cannot accept a binary photo despite the gallery's CTA promising one |
| List API (member) | `functions/api/fanclub/photos.ts` | `GET`, `requireMember`-gated; excludes `is_memorabilia=1` rows; no `status` filter exists because no such column exists |
| Tags API | `functions/api/fanclub/photos/tags.ts` | `GET`, `requireMember`-gated; derives tag list from non-memorabilia `photos` rows |
| List API (public/other) | `functions/api/photos.ts` | `GET`, **no auth check** (`requireMember`/`requireAdmin` absent) — a separate, unauthenticated endpoint over the same `photos` table; distinct from the member-gated API above and out of this task's scope beyond noting its existence |
| URL normalization | `functions/_lib/photo-url.ts` | Read-only; normalizes stored `photos.url` values (handles legacy malformed B2 URLs) for both APIs above |
| B2 access | `functions/_lib/b2.ts` | **Read-only.** `listB2Objects` (S3 ListObjectsV2) and `requireB2` config check. No PUT/write function exists anywhere in the codebase. |
| Admin media sync | `functions/api/admin/media-assets/{list,sync-from-b2}.ts`, `src/app/admin/media-assets/page.tsx` | Admin-only; syncs B2 objects into a separate `media_assets` catalog table — **not** `photos`; no admin CRUD or moderation surface exists for `photos` rows |
| Schema | `migrations/0003_photos.sql`, `0007_photos_metadata.sql` | `photos` columns: `id, url, is_memorabilia, description, created_at, photo_id, title, year, era, type, game_context, location, people, teams, tags, source, rights_notes, is_featured, is_matchup_eligible`. No `status`, no ownership/permission/consent fields, no `credit_line`. |
| Rate limiting (existing pattern) | `functions/api/login.ts` | Only existing example in the codebase: dedicated `login_attempts` D1 table, IP + 1-hour window, 429 on excess. Replicating this pattern for uploads requires a new table/migration. |

### Test inventory

No dedicated test file exists for `functions/api/fanclub/photos.ts`, `functions/api/fanclub/photos/tags.ts`, or `functions/api/photos.ts` (confirmed by search — no `tests/*photo*` file present). `tests/admin-media-assets.test.tsx` covers the separate `media_assets` B2-sync tooling only, not the `photos` table or gallery/upload path. This is a real, pre-existing test-coverage gap, not something #2899/#2900 introduce.

## Preserved behavior versus implementation gaps

| #2857 requirement | Current state | Disposition |
| --- | --- | --- |
| Existing staff-managed gallery behavior remains intact | `/fanclub/photo` read/search/tag-filter behavior is fully functional today | **Preserve as-is** — #2899/#2900 must not regress this |
| Authenticated member can submit an allowed photo with metadata | No binary upload path exists anywhere; `/fanclub/submit` is text-only | **Gap — #2899's core objective** |
| Invalid/oversized/unauthorized/incomplete uploads fail closed | N/A — no upload path exists to fail closed | **Gap — #2899** |
| Submission remains non-public until approved | No `status`/pending column on `photos`; every existing row is implicitly treated as approved (see `functions/api/fanclub/photos.ts` comment: "current schema does not have an explicit approval column... treat current rows as already-approved") | **Gap — schema question, see Unresolved Questions below** |
| Approved photo has an accessible detail experience | No click-through/detail interaction exists in `page.tsx` — clicking a thumbnail does nothing; `fanclub-subpages.md` describes this as "implementation detail," not yet built | **Gap — #2900's core objective, 0% built, not partial** |
| Desktop, tablet, and mobile disposition implemented or explicitly accepted | `fanclub-subpages.md` states "Desktop only — mobile/tablet implementation is deferred" (last reviewed 2026-04-01, stale relative to #2857's own responsive requirement) | **Unresolved cross-reference** — see below |
| Tests cover authorization, validation, moderation, storage failure, presentation | No such tests exist today for any photo surface | **Gap — #2899/#2900 must add, not just extend** |

## Ownership, privacy, rights, retention, and visibility-state map

| Concern | Current state | Required by #2857 | Gap |
| --- | --- | --- | --- |
| Rights/ownership affirmation | Not captured for `photos` rows at all | Ownership statement, permission affirmation, credit preference | No field exists; `content_inventory`/`submission_queue` have equivalent fields (added under #2919 on a different, not-yet-merged branch) but `photos` does not |
| Privacy notice / restrictions | Not captured | Required metadata field | No field exists |
| Visibility state | Implicit "always public" — no `status` column | Private/pending until moderator approval | No mechanism exists to mark a row non-public |
| Retention | No retention/soft-delete fields on `photos` (unlike `members`/`join_requests`, which gained soft-delete under #2919 on a different branch) | Approved privacy/retention decision | Not yet decided or implemented for `photos` |
| Takedown/suppression | No suppression fields on `photos` | Implicit via moderation requirement | Not yet implemented for `photos` |

## Exact implementation file and test allowlist for #2899 and #2900

These are already recorded in #2899's issue body; this report confirms them against live evidence rather than proposing new ones:

- **#2899 (intake):** `functions/api/fanclub/photos/upload.ts` (new), `functions/_lib/member-photo-upload.ts` (new), `tests/member-photo-upload.test.ts` (new). Confirmed gap: #2899's allowlist does not include `functions/_lib/b2.ts`, which is where the only existing B2 client (`AwsClient` from `./aws4fetch`) lives. Either `member-photo-upload.ts` must independently construct its own signed PUT request using the same `AwsClient` pattern (duplicating, not reusing, `b2.ts`'s config/auth logic), or #2899's allowlist needs a small extension to add a write function to `b2.ts` directly. This report takes no position on which — it is exactly the kind of file-scope question #2899 should resolve explicitly before writing code, not silently duplicate logic into.
- **#2900 (moderation + detail UX, not yet read in detail — out of this task's required depth):** will need, at minimum, a new detail route/component (no existing modal or route to extend) and an admin moderation surface for `photos` (none exists today, unlike `content_inventory`'s `/admin/editorial`).

## Failure-safe and rollback boundaries

- Rollback for #2899: revert the component PR; because no schema/migration is authorized, there is no data migration to reverse — only the new upload endpoint and its private quarantine objects (if any test/dev objects were created) need cleanup.
- Failure-safe requirement carried forward: B2-success/D1-failure and D1-success/B2-failure must not leave an orphaned public-looking state — directly relevant because #2899 has no `status` column to mark a partially-failed row non-public (see Unresolved Questions).
- Existing staff-managed gallery (`functions/api/fanclub/photos.ts`, `page.tsx`) is unaffected by any of #2899/#2900's proposed new files — no shared-file collision.

## Unresolved questions (Product/privacy/rights/authority only)

1. **Schema decision required before #2899 can satisfy "non-public until approved."** No `photos.status` (or equivalent) column exists, and #2899's package explicitly authorizes no migration. #2899's own package addresses this ("If #2898 evidence proves a schema change is required, document the exact conflict and continue any collision-safe allowlisted work; return only the schema-dependent portion for a bounded package revision") — this report supplies that exact evidence: **a schema change is required** to store pending/non-public member-uploaded photo records; #2899 cannot fully satisfy its own acceptance criteria without one. Routing this disposition to WORK rather than deciding it here.
2. **Rate limiting requires a new table/migration** (per the `login_attempts` precedent) unless an in-memory or edge-native alternative is acceptable for a Cloudflare Pages Function — also schema-adjacent and same authority boundary as above.
3. **Responsive/mobile disposition** — `fanclub-subpages.md` says desktop-only is deferred, but #2857 asks for "desktop, tablet, and mobile disposition... implemented or explicitly accepted" and references a separate "responsive Fan Club project" this task's evidence scope does not cover. Flagged for reconciliation, not resolved here.
4. **`functions/api/photos.ts`'s missing auth check** — noted as an observed fact (a separate, unauthenticated endpoint over the same `photos` table) but not evaluated here as a defect or intentional public surface; that determination is outside this task's read-only evidence scope and is flagged for whoever owns that endpoint's original intent.

## Validation

- `bash scripts/ci/docs_check_headers.sh .` — run against the two changed files (see PR evidence).
- `node scripts/ci/diataxis_folder_audit.mjs` — `docs/ops/reports/*` passes because it's outside the audited folder set (consistent with every prior report in this program); `docs/reference/design/fanclub-subpages.md` is inside the audited set and was verified to still satisfy its structural requirements after this edit.
- `git diff --check` — run (see PR evidence).
- Every claim above was verified by reading the cited source file directly, not assumed from prior documentation.

## Rollback

This is a documentation-only change across two files. Revert the bounded PR to remove it; no runtime, schema, or public-copy change is made by this task.
