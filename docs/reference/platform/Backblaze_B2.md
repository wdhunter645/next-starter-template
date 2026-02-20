---
Doc Type: TBD
Audience: Human + AI
Authority Level: TBD
Owns: TBD
Does Not Own: TBD
Canonical Reference: TBD
Last Reviewed: 2026-02-20
---

# Backblaze B2 — Resource Inventory (LGFC)

Purpose: Design/resource inventory for Backblaze B2 as used by the LGFC site.  
No operational status notes. No secrets. No app keys.

---

## Account Usage Pattern (LGFC)

- B2 is the canonical object store for site media (photos + memorabilia images + related documents).
- Public site and FanClub **read** from B2 via public base URL / S3-compatible endpoint.
- **Writes/uploads are admin-controlled** (no member/dev uploads).

---

## Bucket Inventory (from console screenshots)

Bucket:
- Name: `LouGehrigFanClub`
- Type: Public
- File lifecycle / versioning: Keep all versions
- Encryption: Enabled
- Object Lock: Disabled
- Current files: ~51
- Current size: ~77.8 MB
- S3-compatible endpoint: `s3.us-east-005.backblazeb2.com`
- Replication: none configured

---

## App Configuration (no secrets)

Expected env vars (names only):
- `B2_KEY_ID`
- `B2_APP_KEY`
- `B2_BUCKET`
- `B2_ENDPOINT`
- `PUBLIC_B2_BASE_URL`

Notes:
- Keys are never stored in repo docs.
- Keys are never logged by scripts.
- all B2 variables are saved as Repo Secrets
---

## How the Site Uses B2

### Public surfaces
- Homepage Weekly Matchup uses B2 image URLs for photo display (via D1 rows that reference object keys / URLs).
- FanClub galleries use B2-backed media entries.

### FanClub surfaces
- `/fanclub/photo`: thumbnails + tag search (photos table references B2 objects).
- `/fanclub/memorabilia`: thumbnails + descriptions; long-form documents live in Library with linkage.
- `/fanclub/library`: reading materials; may link to B2 documents (PDFs/images) where applicable.

---

## D1 Integration Model

Design intent:
- D1 is the index/catalog.
- B2 is the blob store.
- “New media” appears in the site by inserting/upserting D1 rows that reference B2 object keys / URLs.

Primary table(s) involved (as implemented by sync tooling):
- `photos` (B2 → D1 sync targets this table)

Other media tables may exist depending on phase (catalog + metadata), but the current automated sync tooling is explicitly photo-focused.

---

## Repo Tooling (B2 ↔ D1)

These scripts/docs exist in the repo ZIP and define the current sync approach:

Scripts:
- `scripts/b2_inventory_sync.sh`
  - Enumerates objects in the B2 bucket via S3-compatible API and emits normalized JSON inventory.
- `scripts/b2_sync_photos_to_d1.sh`
  - End-to-end pipeline: inventory → enrich → SQL seed → execute via wrangler → verify count.
- `scripts/b2_d1_daily_sync.sh`
  - Delta-only daily sync: compares B2 objects against committed snapshot and upserts only new keys into D1.
- `scripts/d1_media_ingest.js`
  - Reads inventory JSON and inserts only previously unseen objects into D1 (idempotent).

Docs:
- `scripts/B2_D1_SYNC_README.md`
  - Describes daily idempotent B2→D1 incremental sync flow and governance.

Snapshot file (committed reference):
- `data/b2/inventory.json`

Automation:
- GitHub Actions workflow referenced in `scripts/B2_D1_SYNC_README.md`:
  - `.github/workflows/b2-d1-daily-sync.yml`

---

## CORS / Public Access

Bucket is public. The site expects direct GET access to objects via the public base URL.  
CORS rules (if needed) should be documented here once finalized in console.

---

## Future Enhancements (design only)

- Replication rules (optional) for redundancy.
- Snapshot retention policy for `data/b2/inventory.json` history (repo governance).
- Content-type normalization and metadata enrichment for better search/tagging.

