---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Task brief for MEDIA-01 B2 → D1 media pipeline verification
Does Not Own: Product UI / final UX design
Canonical Reference: /docs/ops/tasks/MEDIA-01.md
Last Reviewed: 2026-03-25
---

# MEDIA-01 — B2 → D1 media pipeline verification

## Objective

**Backblaze B2 connectivity is already established** (bucket, keys, CDN/public URLs, and existing CLI or asset flows). MEDIA-01 completes the **D1 side**: list objects via the same S3-compatible API, map metadata into `media_assets`, and prove the path from storage to the database—without new product UI.

## Requirements

- Rely on existing B2 access; exercise **ListObjectsV2** from the automation surface you choose (admin sync route and/or scripts).
- Confirm stable metadata mapping B2 object → D1 `media_assets` rows.
- Ensure D1 schema includes the media index (`migrations/0010_media_assets.sql`).

## Implementation in this repo

| Concern | Location |
| -------- | -------- |
| D1 schema | `migrations/0010_media_assets.sql` |
| S3 SigV4 signing (Workers-safe) | `functions/_lib/aws4fetch.ts` (vendored [aws4fetch](https://github.com/mhart/aws4fetch), MIT) |
| B2 list + `media_uid` (matches `scripts/d1_media_ingest.js`) | `functions/_lib/b2.ts` |
| Admin: index B2 → D1 | `POST /api/admin/media-assets/sync-from-b2` — `functions/api/admin/media-assets/sync-from-b2.ts` |
| Admin: read index | `GET /api/admin/media-assets/list` — `functions/api/admin/media-assets/list.ts` |
| CLI ingest (inventory JSON → D1) | `scripts/b2_inventory_sync.sh` → `scripts/d1_media_ingest.js` |
| CLI sync into `photos` (URLs) | `scripts/b2_d1_incremental_sync.sh` |

## Cloudflare Pages environment secrets

B2 is already reachable from your operational setup; for **Pages Functions** the same credentials must appear as **environment secrets** (production is expected to already have them; add or mirror on preview if you run sync there). Values are read from `env`—never commit them to the repo.

- `B2_ENDPOINT` — e.g. `https://s3.<region>.backblazeb2.com`
- `B2_BUCKET`
- `B2_KEY_ID` / `B2_APP_KEY` — application key with **listObjects** (and read) on the bucket
- `ADMIN_TOKEN` — same pattern for admin API routes

Optional query parameter on sync: `maxObjects` (default `2000`, cap `50000`) to limit a single invocation for large buckets.

## Verification

1. Apply migrations so `media_assets` exists (see repo D1 workflow).
2. **POST** `…/api/admin/media-assets/sync-from-b2` with header `x-admin-token: <ADMIN_TOKEN>` (or `Authorization: Bearer …`).
3. **GET** `…/api/admin/media-assets/list` — confirm new rows (`media_uid`, `b2_key`, `size`, `etag`, …).
4. Alternatively: run `scripts/b2_inventory_sync.sh` and pipe JSON into `node scripts/d1_media_ingest.js` (see script headers).

## Output

- Confirmed list path against the already-connected B2 bucket (admin sync and/or CLI).
- D1 contains indexed `media_assets` rows for processed objects.

## Constraints

- No new public/user-facing UI for MEDIA-01 (admin tooling only).
- No styling work scoped to this task.

## Exit criteria

Given established B2 connectivity, images (and other objects you index) are listable from the bucket and recorded in D1 so frontends and jobs can rely on `media_assets` (and/or follow-on mapping into feature tables).
