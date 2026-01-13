# B2 → D1 Media Ingestion Pipeline

## Overview

The B2 → D1 ingestion pipeline is a fully automated, idempotent system that syncs media files from Backblaze B2 storage to Cloudflare D1 database for indexing and discovery.

## Architecture

### Components

1. **B2 Inventory Script** (`scripts/b2_inventory_sync.sh`)
   - Enumerates all objects in the B2 bucket via S3-compatible API
   - Outputs normalized JSON inventory with metadata (key, size, etag, file_id)
   - Handles pagination automatically
   - Fails fast on authentication or connectivity errors

2. **D1 Ingest Script** (`scripts/d1_media_ingest.js`)
   - Reads B2 inventory JSON
   - Generates stable, deterministic `media_uid` for each object
   - Queries D1 to check for existing records
   - Inserts **only new objects** (never updates or deletes)
   - Fully idempotent: safe to run repeatedly

3. **GitHub Action** (`.github/workflows/b2-d1-daily-sync.yml`)
   - Runs daily at 06:17 UTC via scheduled cron
   - Can be manually triggered via `workflow_dispatch`
   - Orchestrates inventory generation and D1 ingestion
   - Commits updated inventory snapshot to repository

### Database Schema

The pipeline uses the `media_assets` table in D1:

```sql
CREATE TABLE media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_uid TEXT NOT NULL UNIQUE,
  b2_key TEXT NOT NULL,
  b2_file_id TEXT,
  size INTEGER NOT NULL,
  etag TEXT,
  ingested_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Key fields:**
- `media_uid`: Stable, deterministic identifier computed from `b2_file_id` and `b2_key`
- `b2_key`: Object key/path in B2 bucket
- `b2_file_id`: B2's file identifier (from VersionId or ETag)
- `size`: File size in bytes
- `etag`: Object ETag for change detection
- `ingested_at`: Timestamp when record was first inserted

## How It Works

### Media UID Generation

The `media_uid` is generated using a SHA-256 hash of `b2_file_id:b2_key`:

```javascript
media_uid = `b2_${sha256(file_id + ':' + key).substring(0, 40)}`
```

This ensures:
- **Deterministic**: Same file always produces the same UID
- **Unique**: Different files produce different UIDs
- **Stable**: UID doesn't change unless the file is replaced in B2
- **Bounded**: First 40 characters of hash (extremely low collision risk)

### Idempotency

The pipeline is designed to be **fully idempotent**:

1. **No Updates**: Existing records are never modified
2. **No Deletes**: Removing a file from B2 does not delete D1 history
3. **INSERT OR IGNORE**: SQL uses conflict resolution to skip duplicates
4. **Pre-flight Check**: Queries D1 for existing UIDs before generating SQL

**Result**: Running the workflow multiple times with no B2 changes results in zero database modifications.

## Usage

### Manual Trigger

Via GitHub Actions UI:
1. Go to Actions tab
2. Select "B2 → D1 Daily Sync"
3. Click "Run workflow"
4. Select branch and run

### Dry Run Mode

Test locally without modifying D1:

```bash
# Generate inventory (requires B2 credentials)
export B2_KEY_ID="..."
export B2_APP_KEY="..."
export B2_ENDPOINT="..."
export B2_BUCKET="..."
bash scripts/b2_inventory_sync.sh > /tmp/inventory.json

# Test ingest in dry-run mode (no D1 writes)
export DRY_RUN=1
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."
export D1_DATABASE_NAME="lgfc_lite"
node scripts/d1_media_ingest.js /tmp/inventory.json
```

### Verbose Logging

Enable detailed logging for debugging:

```bash
export VERBOSE=1
node scripts/d1_media_ingest.js /tmp/inventory.json
```

## Required Environment Variables

### B2 Inventory Script
- `B2_KEY_ID`: Backblaze application key ID
- `B2_APP_KEY`: Backblaze application key
- `B2_ENDPOINT`: B2 S3-compatible endpoint URL
- `B2_BUCKET`: B2 bucket name

### D1 Ingest Script
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with D1 access
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
- `D1_DATABASE_NAME`: D1 database name (default: `lgfc_lite`)

### Optional
- `DRY_RUN=1`: Generate SQL but don't execute
- `VERBOSE=1`: Enable verbose logging

## Observability

### Logs

The pipeline logs:
- Total objects discovered in B2
- Number of new objects to insert
- Number of already-known objects skipped
- Any errors during inventory or ingestion

### GitHub Action Outputs

The workflow produces:
- Step-by-step execution logs
- Inventory object count
- Ingestion summary (new vs skipped)
- Updated `data/b2/inventory.json` snapshot (committed to repo)

## Troubleshooting

### "No new objects to insert" every run

**Cause**: All objects in B2 are already in D1.

**Resolution**: This is normal. The pipeline is working as designed.

### "Failed to query existing records"

**Cause**: Invalid Cloudflare credentials or D1 database doesn't exist.

**Resolution**: 
1. Verify `CLOUDFLARE_API_TOKEN` has D1 access
2. Verify `D1_DATABASE_NAME` matches actual database
3. Run migration `0010_media_assets.sql` if table doesn't exist

### Objects not being inserted

**Cause**: SQL execution failed silently.

**Resolution**:
1. Check workflow logs for wrangler errors
2. Run locally with `DRY_RUN=1` to inspect SQL
3. Verify D1 schema matches migration

### B2 API errors

**Cause**: Invalid B2 credentials or bucket access.

**Resolution**:
1. Verify B2 credentials are correct
2. Verify bucket name is correct
3. Check B2 service status

## Safety & Governance

### No Data Loss Risk

The pipeline **never deletes data**:
- Removing a file from B2 does not remove it from D1
- D1 maintains historical record of all ingested media
- Re-running the pipeline never modifies existing records

### Atomic Operations

All database operations are wrapped in transactions:
- Either all new records are inserted, or none
- No partial state on error

### Fail-Fast Behavior

The pipeline stops immediately on:
- Missing environment variables
- B2 authentication errors
- AWS CLI errors
- D1 execution errors

## Future Enhancements

Potential improvements:
- Add `last_seen_at` timestamp to track stale/removed objects
- Support for metadata enrichment from B2 object metadata
- Periodic cleanup of stale records
- Integration with photo gallery frontend
- Support for incremental updates using continuation tokens

## Related Documentation

- Migration: `migrations/0010_media_assets.sql`
- Workflow: `.github/workflows/b2-d1-daily-sync.yml`
- CMS Architecture: `docs/architecture/cms.md`
