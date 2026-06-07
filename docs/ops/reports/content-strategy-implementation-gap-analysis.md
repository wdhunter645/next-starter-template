---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Content Strategy / Editorial Inventory Task 001 implementation inventory, approved-docs comparison, and gap classification
Does Not Own: Runtime implementation, D1 migrations, Pages Functions, route/component behavior, workflow YAML, issue creation or closure, labels, production configuration, or final editorial approval
Canonical Reference: /docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md
Related Issues: #1399, #1397, #1256, #1255
Last Reviewed: 2026-06-07
---

# Content Strategy Implementation Gap Analysis

## 1. Executive summary

Task `#1399` is a documentation-only reconciliation task for the Content
Strategy / Editorial Inventory project. It compares the implementation currently
present on `main` against the approved documentation package delivered through
`#1397`.

The current repository already contains a partial editorial spine:

- `content_inventory` and `submission_queue` exist in
  `migrations/0035_editorial_archive.sql`.
- Member submissions can enter `submission_queue` through
  `functions/api/library/submit.ts`.
- Admins can approve or reject pending submissions through
  `functions/api/admin/editorial/review.ts`.
- Approved submissions become draft `content_inventory` rows and can be moved
  between `draft`, `published`, and `archived` through
  `functions/api/admin/editorial/publish.ts`.
- The Fan Club library reads published `content_inventory` records through
  `functions/api/fanclub/library.ts`.
- Memorabilia is implemented as a filtered view of `photos` in
  `functions/api/fanclub/memorabilia.ts`.

The implementation is not yet aligned with the approved target model. Major
remaining gaps require schema, API/data-access, admin/editor UI, public
rendering, search, editorial rotation, and operational validation follow-up.
The highest compatibility risk is the transition from legacy `library_entries`
to `content_inventory`: some reads have moved to `content_inventory`, while
search, legacy library APIs, memorabilia related snippets, admin stats, and
export still read `library_entries`, and there is no backfill, fallback, or
documented migration path in runtime code.

## 2. Required source documents read

This report cites the repository sources required by `#1399`:

| Source | Use in this report |
|---|---|
| `Agent.md` | Read order, authority hierarchy, one-task/one-deliverable boundary. |
| `docs/reference/design/LGFC-Production-Design-and-Standards.md` | D1 canonical table list, `photos` rule, memorabilia rule, and `library_entries` compatibility rule. |
| `docs/ops/ai/SHARED-AGENT-RULES.md` | Evidence-first, one source issue, parser-safe PR, docs-only scope. |
| `docs/ops/ai/CORE-RULES.md` | Issue-first discipline, documentation source tracking, verification discipline, drift prevention. |
| `docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md` | Task 001 scope and recommended future task sequence. |
| `docs/explanation/website/content-strategy.md` | Story-centric strategy, surfaces intended to be dynamically populated from inventory. |
| `docs/reference/website/content-inventory-model.md` | Required `content_inventory`, `submission_queue`, media association, search, and compatibility model. |
| `docs/reference/website/editorial-placement-and-rotation.md` | Allowed sections, public eligibility, related content, and rotation requirements. |
| `docs/how-to/website/add-content-story.md` | Required editor story-entry decisions and fields. |
| `docs/how-to/website/add-content-media.md` | Media association, credit/source, and memorabilia handling procedure. |
| `docs/how-to/website/review-content-submission.md` | Queue review, manual decision, merge/reject/purge expectations. |
| `docs/how-to/website/publish-update-content.md` | Publication checks, source/credit preservation, and eligibility confirmation. |
| `docs/tutorials/website/editor-first-story.md` | First-story workflow and onboarding expectations. |

## 3. Inspected file inventory

### Schema, migrations, seeds, and data operations

| File | Current role |
|---|---|
| `migrations/0002_library_entries.sql` | Initial legacy `library_entries` table with `id`, submitter, title, content, and `created_at`. |
| `migrations/0003_photos.sql` | Initial `photos` table with `is_memorabilia` filter field. |
| `migrations/0004_init_schema.sql` | Consolidated schema for `library_entries` and `photos`; adds `library_entries.is_approved` and `photos.photo_id`. |
| `migrations/0007_photos_metadata.sql` | Adds rich photo metadata fields such as `title`, `year`, `tags`, `source`, and matchup flags. |
| `migrations/0010_media_assets.sql` | Creates B2 `media_assets`; no story-media linkage. |
| `migrations/0035_editorial_archive.sql` | Creates `content_inventory` and `submission_queue`. |
| `scripts/b2_d1_incremental_sync.sh` | Operational photo insert/upsert path for `photos`; not content inventory seed data. |
| `tests/admin-editorial-archive.test.tsx` | Tests submit, review, publish, and Fan Club library inventory read paths. |
| `tests/fanclub-operations.test.tsx` | Tests member library UI, legacy library API gating, photos, and discussions. |

No seed migration or seed script was found that inserts rows into
`content_inventory`, `submission_queue`, or `library_entries`. Photo rows can be
inserted by B2/D1 sync tooling, but that is operational media ingestion rather
than content inventory seed coverage.

### Pages Functions and data-access behavior

| File | Tables used | Current role |
|---|---|---|
| `functions/api/admin/editorial/list.ts` | `submission_queue`, `content_inventory` | Admin list endpoint for queue and inventory records. |
| `functions/api/admin/editorial/review.ts` | `submission_queue`, `content_inventory` | Pending queue review; approve inserts draft inventory; reject marks manual rejection. |
| `functions/api/admin/editorial/publish.ts` | `content_inventory` | Updates inventory status and `published_at`. |
| `functions/api/library/submit.ts` | `submission_queue` | Member text submission intake. |
| `functions/api/fanclub/library.ts` | `content_inventory` | Member library read path for published inventory with `library` section eligibility. |
| `functions/api/library/list.ts` | `library_entries` | Legacy member-gated library list. |
| `functions/api/search.ts` | `faq_entries`, `events`, `milestones`, `friends`, member `discussions`, `library_entries`, `photos` | Public/member search; does not query `content_inventory`. |
| `functions/api/fanclub/photos.ts` | `photos` | Member photo gallery; treats current rows as approved. |
| `functions/api/fanclub/memorabilia.ts` | `photos`, `library_entries` | Member memorabilia view from `photos.is_memorabilia = 1`; includes legacy related library snippets. |
| `functions/api/photos.ts` | `photos` | Public photo listing with optional memorabilia filter. |
| `functions/api/photos/list.ts` | `photos` | Legacy/minimal photo list endpoint. |
| `functions/api/photos/get.ts` | `photos` | Legacy/minimal photo detail endpoint. |
| `functions/api/milestones/list.ts` | `milestones`, `photos` | Homepage/Fan Club milestone read path from dedicated milestones table. |
| `functions/api/discussions/list.ts` | `discussions` | Member-gated discussions read path. |
| `functions/api/admin/stats.ts` | many tables | Counts `library_entries`, `photos`, `content_inventory`, and `submission_queue`. |
| `functions/api/admin/export.ts` | `library_entries`, `photos`, other admin tables | CSV export allowlist does not include `content_inventory` or `submission_queue`. |

### Admin/editor routes and components

| File | Current role |
|---|---|
| `src/app/admin/editorial/page.tsx` | Admin queue review and inventory publication UI. |
| `src/components/admin/AdminNav.tsx` | Admin navigation includes editorial/admin surfaces. |
| `src/components/admin/AdminDashboard.tsx` | Admin dashboard consumes stats. |
| `src/app/admin/media-assets/page.tsx` | B2 media-assets admin; not linked to story inventory. |
| `src/app/admin/audit/page.tsx` | Admin export/reporting; export still omits inventory/queue. |
| `src/app/admin/content/page.tsx` | CMS/page content admin; not content inventory. |
| `src/app/admin/cms/page.tsx` | Content block CMS admin; not content inventory. |

### Public and Fan Club routes/components

| File | Current role |
|---|---|
| `src/app/page.tsx` | Homepage composition; uses CMS spotlight, Weekly Matchup, static About copy, discussions, milestones, calendar, FAQ. |
| `src/components/home/CampaignSpotlightSlot.tsx` | CMS-driven campaign spotlight, not inventory-driven `homepage_spotlight`. |
| `src/components/MilestonesSection.tsx` | Milestones component reads `/api/milestones/list`. |
| `src/components/RecentDiscussionsTeaser.tsx` | Homepage discussion teaser reads member-only `/api/discussions/list` after session check. |
| `src/app/search/page.tsx` | Search UI backed by `/api/search`. |
| `src/app/fanclub/library/page.tsx` | Member library UI backed by `/api/fanclub/library`. |
| `src/app/fanclub/submit/page.tsx` | Member submission UI posts title/body to `/api/library/submit`. |
| `src/app/fanclub/photo/page.tsx` | Member photo gallery. |
| `src/app/fanclub/memorabilia/page.tsx` | Member memorabilia gallery. |

## 4. Schema comparison

### `content_inventory`

Approved model baseline:
`docs/reference/website/content-inventory-model.md` requires a story-centric
inventory with fields for story identity, canonical/alternate handling,
placement, source/credit, event metadata, rotation metadata, publication status,
and timestamps.

Current implementation:
`migrations/0035_editorial_archive.sql:4-38` defines:

- present core fields: `id`, `tag`, `title`, `text`, `story_type`,
  `allowed_sections`, `priority`, `search_text`, `canonical`, `source_name`,
  `source_url`, `credit_line`, `event_date`, `rotation_group`,
  `last_featured`, `feature_weight`, `status`, `created_at`, `updated_at`,
  `published_at`;
- extra fields: `media`, `review_notes`, `submitted_by`;
- status values: `draft`, `published`, `archived`;
- story type values: `primary`, `secondary`, `brief`;
- partial unique canonical constraint:
  `idx_content_inventory_canonical_tag` on `tag` where `canonical = 1`;
- indexes on `(status, priority DESC, updated_at DESC)` and
  `allowed_sections`.

| Finding | Classification | Evidence |
|---|---|---|
| `content_inventory` table exists with core story fields and `draft`/`published`/`archived` status values. | already satisfied | `migrations/0035_editorial_archive.sql:4-28` |
| One canonical row per tag is enforced at the schema level. | already satisfied | `migrations/0035_editorial_archive.sql:30-32` |
| The schema lacks approved `summary`, `perspective_label`, and `event_year` fields. | needs schema delta | `migrations/0035_editorial_archive.sql:4-28`; target fields in `docs/reference/website/content-inventory-model.md` |
| `source_name` is nullable even though publication requires it. | needs schema delta | `migrations/0035_editorial_archive.sql:15`; publication requirements in `docs/reference/website/content-inventory-model.md` |
| `media` is stored as JSON on the inventory row rather than through a story-media association with `photos`. | needs schema delta | `migrations/0035_editorial_archive.sql:9`; `functions/api/admin/editorial/review.ts:125-126` |
| `search_text` exists but is generated only during approval and not maintained by an edit/update workflow. | needs API/data-access delta | `functions/api/admin/editorial/review.ts:132-144` |
| No content inventory seed data exists for canonical, alternate, media-associated, event-year, or rejected examples. | needs operational validation | Search found no seed inserts for `content_inventory` or `submission_queue`; seed requirements are deferred to Task 009 in `docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md`. |

### `submission_queue`

Approved model baseline:
`docs/reference/website/content-inventory-model.md` requires a queue with raw
payload preservation, proposed source/credit/media fields, statuses
`pending`, `triaged`, `under_review`, `approved`, `rejected`, `merged`, and
`purged`, advisory triage fields, manual decision fields, purge metadata, and
timestamps.

Current implementation:
`migrations/0035_editorial_archive.sql:40-58` defines:

- `submission_id`, `submitted_by`, `title`, `description`, `source_url`,
  `proposed_tag`, `media_url`, `status`, `review_notes`, `purge_flag`,
  `created_at`, `updated_at`, `reviewed_at`, and `reviewer`;
- status values `pending`, `approved`, `rejected_auto`, and
  `rejected_manual`;
- index on `(status, created_at DESC)`.

| Finding | Classification | Evidence |
|---|---|---|
| Member submissions can be queued with submitter, title, body, source URL, proposed tag, media URL, and pending status. | already satisfied | `functions/api/library/submit.ts:58-64` |
| The approved status model is not implemented. | needs schema delta | `migrations/0035_editorial_archive.sql:48`; approved statuses in `docs/reference/website/content-inventory-model.md` |
| The queue lacks `payload`, `source_name`, `credit_line`, `media_reference`, `triage_flags`, `duplicate_candidate`, `decision_by`, `decision_at`, `rejected_at`, `purge_eligible_at`, and `retention_reason`. | needs schema delta | `migrations/0035_editorial_archive.sql:40-55` |
| `rejected_auto` exists in the schema, but no runtime writer was found. | needs documentation correction | `migrations/0035_editorial_archive.sql:48`; `functions/api/admin/editorial/review.ts:105-115` writes only `rejected_manual`. |
| There is no merge/update path from queue into an existing inventory row. | needs API/data-access delta | `functions/api/admin/editorial/review.ts:138-166` always inserts a new `content_inventory` row on approve. |
| There is no purge workflow or `purged` queue state. | needs API/data-access delta | `migrations/0035_editorial_archive.sql:48-50` has only `purge_flag`. |

### `photos`, `media_assets`, and seed behavior

| Finding | Classification | Evidence |
|---|---|---|
| `photos` is the canonical media/photo table and includes `is_memorabilia`. | already satisfied | `migrations/0003_photos.sql:2-8`; `migrations/0004_init_schema.sql:24-32` |
| Photo metadata has been expanded with title, year, tags, source, rights notes, featured, and matchup fields. | already satisfied | `migrations/0007_photos_metadata.sql:14-31` |
| `media_assets` tracks B2 assets separately and is not linked to content inventory stories. | needs schema delta | `migrations/0010_media_assets.sql:5-22` |
| No story-media association table or equivalent relation exists with `story_id`, `media_id`, media role, display order, alt text, captions, and media-specific attribution. | needs schema delta | No migration defines that association; approved requirement in `docs/reference/website/content-inventory-model.md`. |
| Fan Club photo APIs treat existing photo rows as approved because there is no photo approval column. | needs operational validation | `functions/api/fanclub/photos.ts:34-36` |

## 5. Submission queue comparison

The current workflow is a minimal submit-review-publish spine:

1. `src/app/fanclub/submit/page.tsx:14-27` posts member name, email, title, and
   content to `/api/library/submit`.
2. `functions/api/library/submit.ts:58-64` writes a `pending`
   `submission_queue` row.
3. `src/app/admin/editorial/page.tsx:96-124` lets an admin approve or reject a
   pending submission.
4. `functions/api/admin/editorial/review.ts:105-115` rejects with
   `rejected_manual`.
5. `functions/api/admin/editorial/review.ts:138-175` approves by inserting a
   draft `content_inventory` row and marking the queue row `approved`.
6. `functions/api/admin/editorial/publish.ts:48-55` changes inventory
   publication state.

| Finding | Classification | Evidence |
|---|---|---|
| Queue records are protected from public rendering by current read paths. | already satisfied | Public/member APIs do not read `submission_queue` except admin editorial endpoints. |
| Human review exists for pending submissions. | already satisfied | `src/app/admin/editorial/page.tsx:168-186`; `functions/api/admin/editorial/review.ts:74-115` |
| Automation is not making factual, canonical, merge, or publication decisions. | already satisfied | No automation writer found for queue triage or auto-publication. |
| Queue review cannot represent `triaged`, `under_review`, `merged`, `purged`, retention hold, or quarterly purge eligibility. | needs schema delta | `migrations/0035_editorial_archive.sql:48-55` |
| Queue review cannot record all approved manual decision metadata. | needs API/data-access delta | `functions/api/admin/editorial/review.ts:102-115`, `168-175` writes only notes, reviewed time, and reviewer. |
| The member submission UI is text-only; media upload/association is explicitly deferred in page copy. | needs admin/editor UI delta | `src/app/fanclub/submit/page.tsx:44-47` |
| The admin queue defaults to pending and does not expose robust filters for all queue states. | needs admin/editor UI delta | `functions/api/admin/editorial/list.ts:29-30`; `src/app/admin/editorial/page.tsx:76` |

## 6. Media/photo association comparison

Approved model baseline:
media supports stories but does not become the editorial authority. Story-media
links must preserve role, display order, caption/alt text, source URL/reference,
and credit data when distinct from story attribution. Memorabilia remains a
tagged/filtered view of `photos`, not a standalone table.

| Finding | Classification | Evidence |
|---|---|---|
| Memorabilia is implemented as `photos` filtered by `is_memorabilia = 1`. | already satisfied | `functions/api/fanclub/memorabilia.ts:34-35`, `49-63`; `functions/api/photos.ts:28-30` |
| Photo gallery excludes memorabilia by filtering `is_memorabilia IS NULL OR is_memorabilia = 0`. | already satisfied | `functions/api/fanclub/photos.ts:34-36` |
| Rich photo metadata exists but is inconsistently exposed across photo APIs. | needs API/data-access delta | `functions/api/fanclub/photos.ts:58-78` selects richer fields; `functions/api/photos/list.ts:12-19` and `functions/api/photos/get.ts:18-20` select legacy minimal fields. |
| Approved story-media association fields are not implemented. | needs schema delta | No migration defines a story-media link table; `content_inventory.media` JSON is used instead. |
| Approval into inventory embeds queue `media_url` JSON instead of linking to a `photos` row. | needs API/data-access delta | `functions/api/admin/editorial/review.ts:125-126`, `140-166` |
| `media_assets` admin is parallel to, not integrated with, `photos` or `content_inventory`. | needs admin/editor UI delta | `migrations/0010_media_assets.sql`; `src/app/admin/media-assets/page.tsx` |
| Photo approval/moderation state is unresolved. | blocked / unclear and requiring Atlas/Bill decision | `functions/api/fanclub/photos.ts:34-36` treats current rows as already approved; approved docs require source/credit review but do not choose a photo approval schema. |

## 7. Admin/editor workflow comparison

| Workflow area | Current state | Classification |
|---|---|---|
| Queue review | Admins can approve pending submissions into draft inventory or reject them. | already satisfied |
| Publication state | Admins can publish, return to draft, or archive inventory rows. | already satisfied |
| Direct story creation | No admin/editor UI creates a new story outside queue approval. | needs admin/editor UI delta |
| Post-approval story editing | No admin/editor UI updates title, text, source, credit, sections, canonical status, event data, or rotation fields after inventory insertion. | needs admin/editor UI delta |
| Alternate perspectives | `canonical` exists, but admin UI does not expose canonical/alternate decisions or `perspective_label`. | needs admin/editor UI delta |
| Allowed section selection | Approval hardcodes `allowed_sections: ['library']`. | needs admin/editor UI delta |
| Source and credit capture | Admin approval UI captures source name, source URL, and credit line. | already satisfied |
| Event and rotation metadata | Review API accepts `event_date`, `rotation_group`, and `feature_weight`, but admin UI does not expose them. | needs admin/editor UI delta |
| Merge/update decisions | No merge workflow exists. | needs admin/editor UI delta |
| Media association review | Queue has `media_url`, but no story-media association picker or media credit review UI exists. | needs admin/editor UI delta |
| Export and audit | Admin stats count inventory and queue, but CSV export excludes both. | needs API/data-access delta |

Key evidence:

- Admin approval payload hardcodes library-only placement:
  `src/app/admin/editorial/page.tsx:101-114`.
- Admin publication UI exposes only status actions:
  `src/app/admin/editorial/page.tsx:208-232`.
- Admin export allowlist excludes inventory/queue:
  `functions/api/admin/export.ts:21-35`.
- Admin stats include inventory/queue counts:
  `functions/api/admin/stats.ts:20-45`.

## 8. Public rendering and dynamic population comparison

Approved model baseline:
published inventory should be able to dynamically populate homepage spotlight,
homepage discussions, homepage milestones, public search, archive, Fan Club
library, and related-content surfaces using `allowed_sections`, priority,
status, canonical preference, source/credit completeness, and exclusion rules.

| Surface | Current implementation | Classification | Evidence |
|---|---|---|---|
| Fan Club library | Reads published inventory rows where `allowed_sections` contains `library`. | already satisfied | `functions/api/fanclub/library.ts:38-55`; `src/app/fanclub/library/page.tsx:49-57` |
| Fan Club library attribution | Maps `credit_line`/`source_name` into author-like display, but UI copy still says "library entries". | needs documentation correction | `functions/api/fanclub/library.ts:60-68`; `src/app/fanclub/library/page.tsx:81-87` |
| Homepage spotlight | Reads CMS content block config, not `content_inventory` with `homepage_spotlight`. | needs public rendering delta | `src/components/home/CampaignSpotlightSlot.tsx:25-37` |
| Homepage milestones | Reads dedicated `milestones` table and joins `photos`, not inventory `event_date`/`event_year` records. | needs public rendering delta | `functions/api/milestones/list.ts:33-44`; `src/components/MilestonesSection.tsx:57-67` |
| Homepage discussions | Reads dedicated member-only `discussions`, not inventory records eligible for `homepage_discussions`. | blocked / unclear and requiring Atlas/Bill decision | `functions/api/discussions/list.ts:18-21`; `src/components/RecentDiscussionsTeaser.tsx:60-83` |
| Public archive/library route | No public `/archive` route was found; archive-like browsing is member-gated under Fan Club library/photo/memorabilia. | blocked / unclear and requiring Atlas/Bill decision | Canonical public routes in `docs/reference/design/LGFC-Production-Design-and-Standards.md` do not list `/archive`; placement docs include `archive`. |
| Related content | No inventory-related-content API/component exists; memorabilia uses a legacy text-match snippet from `library_entries`. | needs public rendering delta | `functions/api/fanclub/memorabilia.ts:77-98` |
| Public exclusion rules | Current inventory read path filters `status = 'published'`; queue is not read publicly. | already satisfied | `functions/api/fanclub/library.ts:38-39`; no public `submission_queue` reads found. |
| Archived inventory | `archived` exists, but no archive-approved inventory reader exists. | needs public rendering delta | `migrations/0035_editorial_archive.sql:22`; no route/API found for `archive` allowed section. |

## 9. Search/discovery comparison

Approved model baseline:
public search should include approved inventory title, text, summary, tag,
`search_text`, source name, credit line, event metadata, and approved media
captions/OCR where available. Public search must exclude queue, rejected, draft,
under-review, archived-hidden, and editorial-hold records.

Current search:

- `src/app/search/page.tsx:39-70` calls `/api/search`.
- `functions/api/search.ts:68-153` searches public FAQ, events, milestones,
  and friends.
- `functions/api/search.ts:155-242` adds member-only discussions,
  `library_entries`, photos, and memorabilia.
- `functions/api/search.ts:244-252` ranks by simple title/body match score and
  paginates.
- No `content_inventory` query is present.

| Finding | Classification | Evidence |
|---|---|---|
| Public/member search exists. | already satisfied | `src/app/search/page.tsx`; `functions/api/search.ts` |
| Search does not index `content_inventory`. | needs search delta | `functions/api/search.ts:68-242` queries other tables only. |
| Search does not filter inventory by `status = 'published'` and `search` in `allowed_sections` because inventory is absent. | needs search delta | `functions/api/search.ts:68-242` |
| Search still indexes legacy `library_entries` for members. | needs search delta | `functions/api/search.ts:178-197` |
| Search does not include inventory `tag`, `summary`, `source_name`, `credit_line`, event metadata, canonical/alternate labels, or media captions/OCR. | needs search delta | `functions/api/search.ts:68-242`; `migrations/0035_editorial_archive.sql:4-28` lacks `summary` and `event_year`. |
| Queue/rejected records are excluded from public search by absence of queue queries. | already satisfied | No `submission_queue` query in `functions/api/search.ts`. |
| Draft inventory is excluded from public search only because inventory is absent, not because an explicit search eligibility rule exists. | needs search delta | `functions/api/search.ts:68-242` |

## 10. Editorial rotation comparison

Approved model baseline:
rotation should consider allowed section, priority, event proximity, event
date/year, rotation group, feature weight, last featured, recent-feature
suppression, and canonical preference. Selection must be deterministic enough
for review and debugging.

| Finding | Classification | Evidence |
|---|---|---|
| Schema contains `rotation_group`, `last_featured`, and `feature_weight`. | already satisfied | `migrations/0035_editorial_archive.sql:18-21` |
| Fan Club library ordering uses `priority DESC`, then `updated_at`, then `id`. | already satisfied | `functions/api/fanclub/library.ts:49-55` |
| No inventory rotation utility, scoring function, or feature-selection API was found. | needs editorial rotation delta | Searches found no runtime reads of `rotation_group`, `last_featured`, or `feature_weight` for selection. |
| `last_featured` is not updated by publish or a rotation process. | needs editorial rotation delta | `functions/api/admin/editorial/publish.ts:48-55` updates only `status`, `updated_at`, and `published_at`. |
| Homepage feature surfaces do not consume `homepage_spotlight`, `homepage_discussions`, or `homepage_milestones` inventory eligibility. | needs editorial rotation delta | `src/app/page.tsx:30-93`; `CampaignSpotlightSlot`, `MilestonesSection`, and `RecentDiscussionsTeaser` use other data sources. |
| Weekly Matchup has its own active matchup selection and is not inventory editorial rotation. | already satisfied | `src/app/page.tsx:32-36`; weekly matchup behavior is separate from inventory docs. |
| Whether milestones/discussions should migrate fully into inventory or remain parallel canonical tables is not settled by runtime code. | blocked / unclear and requiring Atlas/Bill decision | `functions/api/milestones/list.ts:33-44`; `functions/api/discussions/list.ts:18-21`; placement docs identify inventory eligibility for those surfaces. |

## 11. `library_entries` compatibility assessment

The production design authority states that `library_entries` is a legacy Day 1
written-content table and must not be silently orphaned if reads move to
`content_inventory`; implementations must provide explicit backfill, fallback,
or a documented migration path.

Current state:

- `library_entries` schema exists in `migrations/0002_library_entries.sql:2-12`
  and `migrations/0004_init_schema.sql:14-22`.
- `library_entries.is_approved` exists in `migrations/0004_init_schema.sql:20-21`,
  but current legacy reads do not filter it.
- No current runtime write path inserts into `library_entries`; member
  submissions now insert into `submission_queue`.
- Fan Club library UI uses `/api/fanclub/library`, which reads
  `content_inventory`, not `library_entries`.
- Legacy `/api/library/list` still reads `library_entries`.
- Search still reads `library_entries`.
- Memorabilia related snippets still read `library_entries`.
- Admin stats count `library_entries`, and admin export supports
  `library_entries`.
- No backfill, fallback, dual-read compatibility layer, deprecation plan, or
  migration path from `library_entries` to `content_inventory` was found in
  runtime code.

| Finding | Classification | Evidence |
|---|---|---|
| Legacy `library_entries` data is still preserved by schema and reads. | already satisfied | `migrations/0002_library_entries.sql:2-12`; `functions/api/library/list.ts:18-22` |
| Fan Club library has moved to `content_inventory` without a legacy fallback. | needs API/data-access delta | `functions/api/fanclub/library.ts:21-22`, `38-55`; no `library_entries` fallback. |
| Member search still indexes legacy `library_entries` rather than `content_inventory`. | needs search delta | `functions/api/search.ts:178-197` |
| Memorabilia related content uses legacy `library_entries` text matching rather than story relationships. | needs public rendering delta | `functions/api/fanclub/memorabilia.ts:77-98` |
| No backfill or migration path from `library_entries` to `content_inventory` exists. | needs operational validation | No migration/script found for `library_entries` to `content_inventory` conversion. |
| The intended compatibility policy needs an Atlas/Bill decision before runtime switch-over. | blocked / unclear and requiring Atlas/Bill decision | Design requires no silent orphaning; current code is split across old and new read paths. |

Compatibility risk level: **high**. The next implementation sequence should not
move additional public/member reads to `content_inventory` until the legacy data
path is explicitly selected: backfill, fallback, dual-read bridge, or documented
deprecation with owner approval.

## 12. Gap register table

| ID | Finding | Classification | Suggested next owner task |
|---|---|---|---|
| G-001 | `content_inventory` lacks `summary`, `perspective_label`, and `event_year`. | needs schema delta | Task 002 - Content Inventory Schema Delta |
| G-002 | `source_name` is nullable despite publication source requirements. | needs schema delta | Task 002 |
| G-003 | Canonical tag constraint exists. | already satisfied | Preserve in Task 002 |
| G-004 | `content_inventory.media` JSON bypasses approved story-media association with `photos`. | needs schema delta | Task 004 - Media Association and Attribution Delta |
| G-005 | No inventory seed/pilot records exist for validation. | needs operational validation | Task 009 - Seed Content and Verification Pack |
| G-006 | `submission_queue` status enum differs from approved queue model. | needs schema delta | Task 003 - Submission Queue and Review State Delta |
| G-007 | Queue lacks raw payload, triage, duplicate, decision, purge, and retention fields. | needs schema delta | Task 003 |
| G-008 | `rejected_auto` exists in schema but no writer was found. | needs documentation correction | Task 003 or documentation correction decision |
| G-009 | Approve always inserts new inventory; no merge/update path exists. | needs API/data-access delta | Task 003 |
| G-010 | Quarterly purge is not represented beyond `purge_flag`. | needs API/data-access delta | Task 003 |
| G-011 | Member text submission exists. | already satisfied | Preserve in Task 003 |
| G-012 | Member/media submission path is missing beyond text and optional API-level `media_url`. | needs admin/editor UI delta | Task 004 or Task 005 |
| G-013 | Memorabilia remains a filtered `photos` view. | already satisfied | Preserve in Task 004 |
| G-014 | Photo approval/moderation state is unresolved. | blocked / unclear and requiring Atlas/Bill decision | Task 004 |
| G-015 | Admin review and publish spine exists. | already satisfied | Preserve in Task 005 |
| G-016 | Admin UI hardcodes `allowed_sections: ['library']`. | needs admin/editor UI delta | Task 005 |
| G-017 | Admin UI lacks direct story creation/editing, canonical/alternate controls, merge, media association, and rotation controls. | needs admin/editor UI delta | Task 005 |
| G-018 | Admin export excludes `content_inventory` and `submission_queue`. | needs API/data-access delta | Task 005 or ops-admin follow-up |
| G-019 | Fan Club library reads published inventory. | already satisfied | Preserve in Task 006 |
| G-020 | Fan Club library copy still describes "library entries" while reading inventory. | needs documentation correction | Task 006 or content/UI copy correction |
| G-021 | Homepage spotlight is CMS-driven, not inventory-driven. | needs public rendering delta | Task 006 |
| G-022 | Homepage milestones read the `milestones` table, not inventory event records. | needs public rendering delta | Task 006 |
| G-023 | Homepage discussions read `discussions`; whether inventory should provide prompts is unresolved. | blocked / unclear and requiring Atlas/Bill decision | Task 006 |
| G-024 | No public archive route was found, while docs include `archive` as a section key. | blocked / unclear and requiring Atlas/Bill decision | Task 006 |
| G-025 | Related-content modules are not implemented. | needs public rendering delta | Task 006 |
| G-026 | Public search exists but does not query `content_inventory`. | needs search delta | Task 007 - Search and Discovery Delta |
| G-027 | Search still indexes `library_entries` for members. | needs search delta | Task 007 with compatibility decision |
| G-028 | Search does not cover inventory source, credit, event metadata, canonical/alternate grouping, media captions, or OCR. | needs search delta | Task 007 |
| G-029 | Queue/rejected records are absent from public search. | already satisfied | Preserve in Task 007 |
| G-030 | Rotation fields exist but are not consumed by a rotation engine. | needs editorial rotation delta | Task 008 - Editorial Rotation Delta |
| G-031 | `last_featured` is not written by publication or rotation behavior. | needs editorial rotation delta | Task 008 |
| G-032 | Library ordering uses priority but no event proximity, group diversity, weight, recent-feature penalty, or canonical preference. | needs editorial rotation delta | Task 008 |
| G-033 | `library_entries` lacks backfill, fallback, or migration path into `content_inventory`. | needs operational validation | Task 002/006/007 prerequisite decision |
| G-034 | Policy for deprecating, dual-reading, or backfilling `library_entries` is unresolved. | blocked / unclear and requiring Atlas/Bill decision | Atlas/Bill decision before Tasks 006-007 |
| G-035 | Older content-inventory reference docs conflict with the approved website model. | needs documentation correction | Documentation correction issue only if Atlas/Bill authorizes it |

## 13. Recommended next child issue sequence

No child implementation issues are created by this report. The sequence below is
recommended for Atlas/Bill review and future issue creation only.

1. **Decision checkpoint: `library_entries` compatibility path**
   - Choose one of: backfill, fallback/dual-read, or documented deprecation.
   - This should precede any additional public/member read migration.

2. **Task 002 - Content Inventory Schema Delta**
   - Add or reconcile `summary`, `perspective_label`, `event_year`, stricter
     publication attribution behavior, and compatibility strategy hooks.
   - Preserve the existing canonical-tag invariant.

3. **Task 003 - Submission Queue and Review State Delta**
   - Reconcile queue fields and status values.
   - Add triage, duplicate, merge, decision, rejection, purge, and retention
     semantics.

4. **Task 004 - Media Association and Attribution Delta**
   - Define story-media association with `photos`.
   - Preserve memorabilia as a filtered `photos` view.
   - Decide whether photo approval/status belongs in `photos` or workflow state.

5. **Task 005 - Admin/Editor Workflow Delta**
   - Add direct story creation/editing, section selection, canonical/alternate
     controls, merge decisions, media association review, rotation fields, and
     export/audit support as authorized.

6. **Task 006 - Public Dynamic Population Delta**
   - Extend published inventory reads to approved surfaces after schema and
     admin workflows can express the required data.
   - Resolve homepage milestones/discussions/archive scope before route changes.

7. **Task 007 - Search and Discovery Delta**
   - Add inventory search with `search` section eligibility and explicit
     exclusion rules.
   - Reconcile or retire legacy `library_entries` search only after the
     compatibility decision.

8. **Task 008 - Editorial Rotation Delta**
   - Implement deterministic rotation scoring and `last_featured` behavior.
   - Use priority, event proximity, event year/date, rotation group, feature
     weight, recent-feature penalty, and canonical preference.

9. **Task 009 - Seed Content and Verification Pack**
   - Add seed/pilot data that exercises canonical, alternate, media-associated,
     event-year, rejected, and exclusion cases.

## 14. Explicit no-runtime-change assertion

This report is a docs-only implementation inventory and gap analysis. It does
not change application code, routes, components, CSS, D1 migrations, Pages
Functions, workflow YAML, package files, production configuration, credentials,
issue labels, issue states, or runtime behavior.

The only file authorized and intended to change in this PR is:

- `docs/ops/reports/content-strategy-implementation-gap-analysis.md`

## 15. Validation plan

Required validation for this report:

```bash
./scripts/ci/docs_check_headers.sh .
./scripts/ci/docs_canonical_hashes_verify.sh .
git diff --name-only origin/main...HEAD
```

If the global docs header check fails because of an existing out-of-scope
repository blocker, the changed-file scoped header check should be run and both
results should be recorded in the PR body.
