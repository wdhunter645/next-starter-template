---
Doc Type: Reference
Audience: Bill, ChatGPT, Cursor, database implementers, and LGFC maintainers
Authority Level: Controlled
Owns: D1/B2 storage boundary design for LGFC content pipeline metadata and media
Does Not Own: Migration files, runtime code, bucket configuration, or merge approval
Canonical Reference: /docs/reference/content/lgfc-content-candidate-model.md
Related issues: #2273, #2278, #2274, #2275
Last Reviewed: 2026-07-05
---

# Content Pipeline Storage Model

## Purpose

Design durable storage for the LGFC content pipeline: D1 for metadata and review
state; B2 for media blobs. This reference prepares implementation without
authorizing migrations in Program #2273.

## Design principle

**D1 = index, state, relationships. B2 = binaries.**

Do not store large blobs in D1. Do not treat repo JSON as operational truth.

## Existing surface reuse

| Existing table | Reuse in pipeline | Notes |
| --- | --- | --- |
| `content_inventory` | **Keep** — publication destination | Post-conversion editorial stories |
| `submission_queue` | **Keep** — transition intake | Member submit until `member_submissions` exists |
| `photos` | **Keep** — approved photo catalog | Promotion after rights clearance |
| `media_assets` | **Extend reference** — B2 registry | Link via `media_asset_id` / `b2_key` |
| `content_inventory_media` | **Keep** — story-media joins | Post-conversion associations |
| `library_entries` | **Legacy read fallback** | No new writes |

## Recommended new D1 tables

| Table | Owns |
| --- | --- |
| `sources` | Domain/source trust, blocked sources |
| `submitters` | Member/operator submitter identity |
| `content_items` | Canonical candidate metadata (all streams) |
| `member_submissions` | Member extension fields + queue link |
| `content_item_tags` | Normalized tag mappings |
| `tags` | Tag dictionary |
| `moderation_events` | Append-only audit trail |
| `publication_candidates` | Publication prep staging (target, credit, eligibility) |
| `crawl_runs` | Future scheduled discovery runs |
| `maintenance_runs` | Stale link check, duplicate scan runs |

`content_items` maps 1:1 with candidate registry fields in canonical model.

## Entity relationships

```text
sources 1—* content_items
submitters 1—* member_submissions
content_items 1—1 member_submissions (optional)
content_items *—* tags (via content_item_tags)
content_items 1—* moderation_events
content_items 1—* publication_candidates
content_items 0—1 content_inventory (after conversion)
media_assets 0—* content_items (via media_asset_id)
photos 0—1 media_assets (promotion path)
```

## Media storage recommendation

**Recommendation: B2 (existing LGFC standard)**

| Factor | B2 | R2 |
| --- | --- | --- |
| Current LGFC use | Active `LouGehrigFanClub` bucket | Not deployed |
| D1 integration | `media_assets` + ingest scripts | Would require new integration |
| Member upload future | Extend admin-controlled upload path | Alternative if Cloudflare consolidation required |

R2 remains a documented alternative for a future platform decision issue.
Default implementation path: **B2**.

## Seed JSON promotion path

| Stage | Storage |
| --- | --- |
| Pilot | `data/research/lou-gehrig-content-candidates.json` |
| Import script (future) | Validates against schema → inserts `content_items` |
| Idempotency | Upsert on `candidate_id` |
| Cutover | JSON becomes export/backup only |

## Audit event storage

`moderation_events` columns (recommended):

| Column | Purpose |
| --- | --- |
| `id` | PK |
| `content_item_id` | FK |
| `event_type` | review, rights, privacy, publication, duplicate, promotion |
| `actor` | operator/admin id |
| `from_state` / `to_state` | JSON snapshot |
| `notes` | optional |
| `created_at` | timestamp |

## Retention and purge states

| State | Surface | Action |
| --- | --- | --- |
| Candidate rejected | `content_items.review_status = rejected` | retain metadata; no public use |
| Queue purged | `submission_queue.status = purged` | existing quarterly policy |
| Soft delete | future `deleted_at` on `content_items` | hide from review queues |
| Hard purge | eligibility worker (future) | preserve `moderation_events` summary |

Align with `submission_queue` purge fields from migration 0037.

## Admin review data requirements

Admin tools need read/write on:

- `sources`, `content_items`, `member_submissions`
- `moderation_events` (append)
- `publication_candidates` (staging)
- join views to `submission_queue`, `content_inventory`, `media_assets`

## Public safety

No admin or public API may expose raw candidate rows without review-state filters.
Public routes continue reading `content_inventory` via safe helper only.

## Cross-references

- Implementation plan: `docs/ops/reports/content-pipeline-storage-implementation-plan.md`
- Canonical model: `docs/reference/content/lgfc-content-candidate-model.md`
- Platform B2: `docs/reference/platform/Backblaze_B2.md`
