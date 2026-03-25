# MEDIA-01 — B2 → D1 media pipeline verification

## Objective

Establish a working pipeline between Backblaze B2 and D1 so image (and other) objects can be listed from B2 and indexed in D1 for use by the app—without adding product UI.

## Requirements

- Verify B2 bucket access (S3-compatible ListObjectsV2).
- Confirm listing capability and stable metadata mapping into D1.
- Ensure D1 table structure exists for the media index (`media_assets`).

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

## Pages / secrets

Configure on the Cloudflare Pages project (production and preview as needed):

- `B2_ENDPOINT` — e.g. `https://s3.<region>.backblazeb2.com`
- `B2_BUCKET`
- `B2_KEY_ID` / `B2_APP_KEY` — application key with **listObjects** (and read) on the bucket
- Existing `ADMIN_TOKEN` for admin API routes

Optional query parameter on sync: `maxObjects` (default `2000`, cap `50000`) to limit a single invocation for large buckets.

## Verification

1. Apply migrations so `media_assets` exists (see repo D1 workflow).
2. **POST** `…/api/admin/media-assets/sync-from-b2` with header `x-admin-token: <ADMIN_TOKEN>` (or `Authorization: Bearer …`).
3. **GET** `…/api/admin/media-assets/list` — confirm new rows (`media_uid`, `b2_key`, `size`, `etag`, …).
4. Alternatively: run `scripts/b2_inventory_sync.sh` and pipe JSON into `node scripts/d1_media_ingest.js` (see script headers).

## Output

- Confirmed read/list path from B2 (via admin sync or CLI).
- D1 contains indexed `media_assets` rows for processed objects.

## Constraints

- No new public/user-facing UI for MEDIA-01 (admin tooling only).
- No styling work scoped to this task.

## Exit criteria

Images (and other objects you choose to index) can be listed from B2 and recorded in D1 so frontends and jobs can rely on `media_assets` (and/or follow-on mapping into feature tables).
