---
Doc Type: Operations
Audience: Bill, ChatGPT / Atlas, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2664 as-built route/component/API/schema/test inventory, reuse-vs-change matrix, migration/caching/concurrency/performance risk register, and Phase 1 implementation allowlists for Club Newspaper editorial operations
Does Not Own: The operator procedure itself (canonical in `docs/how-to/website/club-home-content-operations-runbook.md`), the rotation/edition contract (#2663, canonical in `content-strategy.md`), the zone/responsive/accessibility contract (#2662, canonical in `fanclub-home.md`), or any runtime implementation
Canonical Reference: /docs/how-to/website/club-home-content-operations-runbook.md
Related Issues: #2461, #2433, #2434, #2661, #2662, #2663, #2664, #2934
Last Reviewed: 2026-08-06
---

# Club Newspaper Editorial Operations and Technical Boundary Verification (#2664)

## Purpose

Verify the current admin/editorial route, component, API, schema, and test surface against #2461's "Admin and editorial operating model" requirements, and produce a reuse-vs-change matrix, risk register, and Phase 1 implementation allowlist for a future, separately authorized runtime task — without performing any runtime change here.

## Scope

In scope: the as-built inventory of every admin/editorial file that operates `content_inventory`/`submission_queue`/`content_inventory_media`; comparing that inventory's actual capability against #2461's required admin operations (preview, pinning, exclusion, media substitution, regeneration, approval, takedown, audit, troubleshooting); migration, caching, concurrency, and performance risk notes for closing the identified gaps; and exact proposed writable paths for a future Phase 1 implementation task.

Out of scope: implementing any of the identified gaps, #2662/#2663's own charters, and CC-001/CC-002's own field contracts.

## Current known truth

### As-built route/component/API inventory

| Surface | Path | Verified role |
| --- | --- | --- |
| Admin editorial UI | `src/app/admin/editorial/page.tsx` (951 lines) | Single page; every backend action below is wired to a UI control — no orphaned backend capability, confirmed by reading the full file |
| List/preview | `functions/api/admin/editorial/list.ts` | `GET`; returns `submission_queue` rows plus `content_inventory` rows (any status, including `draft`) with inline `media_associations` — this is the preview surface |
| Submission review | `functions/api/admin/editorial/review.ts` | `POST`; submission lifecycle actions: `triage`, `start_review`, `approve` (creates a `draft` `content_inventory` row), `merge`, `reject`, `purge` |
| Draft inventory CRUD | `functions/api/admin/editorial/inventory.ts` | `POST`; direct create (`id` omitted) or update (`id` present) of `content_inventory` draft metadata, independent of the submission queue |
| Publish/unpublish/archive | `functions/api/admin/editorial/publish.ts` | `POST`; `status` transitions among `draft`/`published`/`archived`; confirmed (`page.tsx` line 754) that publish→`draft` on an already-published row is a distinct wired "unpublish" UI action, not merely a side effect |
| Media pairing | `functions/api/admin/editorial/media-associations.ts` | `GET`/`POST`; reads/replaces `content_inventory_media` rows for one story; enforces `alt_text` for public-facing media roles |
| Club Home read path | `functions/_lib/content-inventory-club-home.ts`, `functions/api/fanclub/home.ts` | Read-only; selects/ranks published `club_home` rows for the live page (verified in #2661/#2663) |

### Schema surfaces touched

`content_inventory`, `submission_queue`, `content_inventory_media`, `photos` — all pre-existing; no schema change was made or is proposed by this report.

### Test inventory

| Test file | Covers |
| --- | --- |
| `tests/admin-editorial-archive.test.tsx` | Admin editorial UI archive/publish-state behavior |
| `tests/content-inventory-club-home.test.ts` | `fetchClubHomeContent` selection logic |
| `tests/content-inventory-media.test.ts` | `content_inventory_media` normalization/association helpers |
| `tests/content-inventory-public.test.ts`, `content-inventory-public-surface-validation.test.ts` | Public-surface eligibility/exposure rules |
| `tests/content-inventory-rotation.test.ts` | Rotation scoring (`computeRotationScore` and related) |
| `tests/content-inventory-search.test.ts`, `content-inventory-seed.test.ts` | Search indexing and seed data |
| `tests/fanclub-home-dynamic.test.tsx`, `fanclub-home-shell.test.tsx` | `/fanclub` page rendering and session gate |

No test file targets `functions/api/admin/editorial/review.ts`, `inventory.ts`, `publish.ts`, or `media-associations.ts` directly by name (searched `tests/` for `editorial-review`, `editorial-publish`, `editorial-inventory`, `editorial-media` — none exist). This is a real test-coverage gap on the admin-write side of the editorial system, distinct from the read-side coverage above, which is thorough.

## Intended final state

- This report becomes the single as-built reference a future Phase 1 implementation task reads before building pinning, edition persistence, a placement-history log, or media renditions — so that task starts from verified current-state facts rather than re-auditing the admin system from scratch.
- The identified test-coverage gap (no direct tests for `review.ts`/`inventory.ts`/`publish.ts`/`media-associations.ts`) is either closed by that future task or explicitly accepted as a known limitation before it ships new admin-write capability on top of untested existing capability.

## #2461 admin/editorial requirement vs. as-built capability

| #2461 requirement | As-built capability | Disposition |
| --- | --- | --- |
| Staging and preview | `GET /api/admin/editorial/list?inventory_status=draft` — draft rows are never public | **Match** |
| Pinning and exclusion | Exclusion: **match** (unpublish-to-draft or archive, both reversible via `publish.ts`). Pinning: **gap** — no mechanism exists (confirmed absent in #2663's contract and re-confirmed here by reading every admin/editorial file) |
| Media substitution | `GET`/`POST /api/admin/editorial/media-associations` — full wholesale replacement of a story's media pairings | **Match** |
| Edition regeneration | **Gap** — no edition concept exists anywhere in the reviewed surface; `club_home` recomputes fresh per request (confirmed in #2661/#2663) |
| Publication approval | `review.ts`'s `approve`/`merge`/`reject` plus `publish.ts`'s `published` transition | **Match** |
| Takedown | **Gap on this branch.** A suppress action exists only on `component/compliance-readiness` (#2919), not merged here — do not assume availability |
| Audit | **Partial** — `review_notes` is an append-only free-text trail (`appendText` in `review.ts`) and `last_featured`/`updated_at` are single timestamps; neither is a structured per-action audit log (who did what, when, to which field) |
| Troubleshooting | **New this task** — documented in the runbook's new "Troubleshooting" section, derived directly from reading each endpoint's error-response branches |

## Reuse-versus-change matrix

| Existing capability | Reuse or change for Phase 1 gap-closing work |
| --- | --- |
| `submission_queue` review lifecycle (`review.ts`) | **Reuse as-is** — no #2461 gap traces to this surface |
| `content_inventory` draft CRUD (`inventory.ts`) | **Reuse as-is**; a future pinning field would extend this endpoint's accepted body, not replace it |
| Publish/unpublish/archive (`publish.ts`) | **Reuse as-is** for exclusion; a future edition-regeneration feature would be a new, additive capability layered on top, not a replacement |
| Media association model (`content-inventory-media.ts`) | **Reuse and extend** — rendition support (#2663's gap) would add fields to `NormalizedMediaAssociation`/`content_inventory_media`, not introduce a parallel media model |
| Rotation scoring (`content-inventory-rotation.ts`) | **Reuse and extend** — usage-count/placement-history (#2663's gap) would add a new table/field consumed by this module's existing ranking function, not replace the scoring formula itself |
| Admin editorial UI (`page.tsx`) | **Reuse and extend** — new controls (pin toggle, edition regenerate button) would be added to the existing single-page structure, not a new admin route |

## Migration, caching, concurrency, and performance risks (for future Phase 1 work — not authorized here)

- **Migration:** any usage-count, placement-history, pinning, or edition table is additive (forward-only), consistent with every migration in `migrations/` reviewed across this project's prior tasks; no existing column requires alteration to add these.
- **Caching:** `GET /api/fanclub/home` has no caching layer today (confirmed: no `Cache-Control` handling or KV/cache read in `content-inventory-club-home.ts` or `functions/api/fanclub/home.ts`); introducing a persisted "edition" implies a caching or pre-computation decision that does not exist today and must be designed, not assumed.
- **Concurrency:** `recordRotationFeature` (`content-inventory-rotation.ts`) does a plain `UPDATE ... WHERE id = ? AND status = 'published'` with no optimistic-lock or transaction wrapping; a future placement-history write racing with a concurrent publish/unpublish action has not been analyzed and would need explicit handling (e.g., a D1 batch/transaction) before implementation.
- **Performance:** `fetchClubHomeRows` selects and ranks the full eligible `club_home` row set on every request with no pagination or limit at the query level (`sortRotationRows` operates in-memory after a full table scan of eligible rows); this is currently fine at present content volume but should be re-evaluated if a placement-history join is added to the same request path.

## Exact proposed writable paths for a future Phase 1 implementation task

- `functions/_lib/content-inventory-rotation.ts`, `functions/_lib/content-inventory-club-home.ts` — usage-count/placement-history/hard-cooldown logic
- `functions/api/admin/editorial/inventory.ts`, `functions/api/admin/editorial/publish.ts`, `src/app/admin/editorial/page.tsx` — pinning UI/API
- `functions/_lib/content-inventory-media.ts`, a new migration for rendition fields — media renditions
- New forward-only migration(s) for any new table (placement history, editions, pins)
- New focused tests under `tests/` for every above file, and closing the identified gap by adding tests for `review.ts`/`inventory.ts`/`publish.ts`/`media-associations.ts` before or alongside new capability, not after

None of these are touched by this task.

## Validation

- `bash scripts/ci/docs_check_headers.sh .` — run against the two changed/added files (see PR evidence).
- `node scripts/ci/diataxis_folder_audit.mjs` — passes for `docs/ops/reports/*` for the same reason recorded on #2661/#2662/#2663's reports (outside the audited folder set); `docs/how-to/website/club-home-content-operations-runbook.md` is inside the audited set and was verified to still carry a `## Steps`/`## Procedure` heading after this edit.
- `git diff --check` — run (see PR evidence).
- Every claim above was verified by reading the cited source file directly (`list.ts`, `review.ts`, `inventory.ts`, `publish.ts`, `media-associations.ts`, `page.tsx`, and the `tests/` directory listing), not assumed from prior summaries.

## Rollback

This is a documentation-only change across two files (the runbook, this report). Revert the bounded PR to remove it; no runtime, schema, or public-copy change is made by this task.
