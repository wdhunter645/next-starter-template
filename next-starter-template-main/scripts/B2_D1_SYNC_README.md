# B2 → D1 Incremental Sync

## Overview

The `b2_d1_incremental_sync.sh` script provides a **daily, idempotent** synchronization of Backblaze B2 objects to Cloudflare D1 database. It detects new files and inserts only previously unseen objects into the `photos` table.

## Key Features

- ✅ **Idempotent**: Safe to re-run indefinitely, no duplicates
- ✅ **Additive only**: No updates, no deletes, no backfills
- ✅ **Delta-based**: Compares B2 against D1 to insert only new files
- ✅ **Secure**: SQL injection protection, no secrets logged
- ✅ **Robust**: Explicit error codes for different failure scenarios

## Usage

### GitHub Actions (Automated)

The workflow runs automatically daily at 06:17 UTC via `.github/workflows/b2-d1-daily-sync.yml`.

Manual trigger:
```bash
# Via GitHub UI: Actions → B2 → D1 Daily Sync → Run workflow
```

### Manual Execution

```bash
export B2_ENDPOINT="https://s3.us-west-004.backblazeb2.com"
export B2_BUCKET="your-bucket-name"
export B2_KEY_ID="your-key-id"
export B2_APP_KEY="your-app-key"
export D1_DATABASE_ID="your-d1-database-name"
export CLOUDFLARE_API_TOKEN="your-cf-token"
export CLOUDFLARE_ACCOUNT_ID="your-cf-account-id"
export PUBLIC_B2_BASE_URL="https://cdn.example.com"

bash scripts/b2_d1_incremental_sync.sh
```

### Dry Run Mode

Test without making changes:

```bash
export DRY_RUN=1
bash scripts/b2_d1_incremental_sync.sh
```

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| `B2_ENDPOINT` | B2 S3-compatible endpoint URL |
| `B2_BUCKET` | B2 bucket name |
| `B2_KEY_ID` | B2 application key ID |
| `B2_APP_KEY` | B2 application key |
| `D1_DATABASE_ID` | D1 database ID or name |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with D1 access |

## Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | (from wrangler config) |
| `PUBLIC_B2_BASE_URL` | Base URL for public access | `B2_ENDPOINT` |
| `DRY_RUN` | Generate SQL but don't execute (1=yes, 0=no) | `0` |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Missing required environment variable |
| 2 | B2 connection/authentication failure |
| 3 | D1 query failure |
| 4 | SQL execution failure |

## Data Schema

The script inserts into the `photos` table with the following mapping:

| D1 Column | B2 Source | Description |
|-----------|-----------|-------------|
| `photo_id` | Object `Key` | Unique identifier (external_id) |
| `url` | Object `Key` + base URL | Full public URL |
| `is_memorabilia` | Hardcoded | Set to `0` |
| `description` | Hardcoded | Empty string (for future use) |
| `created_at` | Object `LastModified` | Upload timestamp |

## Workflow

1. **Fetch B2 objects** via S3-compatible API (with pagination)
2. **Normalize** to standard format (external_id, filename, public_url, size, uploaded_at)
3. **Query D1** for existing `photo_id` values
4. **Calculate delta** (new objects = B2 objects - D1 records)
5. **Generate SQL** INSERT OR IGNORE statements for new objects only
6. **Execute SQL** via `wrangler d1 execute`
7. **Log summary** (counts only, no secrets)

## Idempotency Guarantees

- Uses `INSERT OR IGNORE` to prevent duplicate inserts
- Compares B2 keys against existing `photo_id` values before inserting
- Safe to run multiple times per day
- No updates or deletes, only inserts

## Testing

Run integration tests:

```bash
bash scripts/test_b2_d1_incremental_sync.sh
```

Tests verify:
- Script syntax and executability
- Environment variable validation
- Documentation completeness
- DRY_RUN mode support
- Error handling patterns
- SQL injection protection
- Idempotency patterns

## Security

- **No secrets logged**: All logging to stderr, no credentials exposed
- **SQL injection protection**: All user inputs escaped via `sql_escape()`
- **Strict error handling**: Uses `set -euo pipefail`
- **CodeQL verified**: 0 security alerts
- **Shellcheck clean**: All warnings resolved

## Rollback

To disable:
1. Delete or disable `.github/workflows/b2-d1-daily-sync.yml`
2. No data rollback needed (additive only)

## Troubleshooting

### "ERROR: Required environment variable X is not set"
Ensure all required env vars are set. See [Required Environment Variables](#required-environment-variables).

### "ERROR: Failed to list B2 objects"
- Verify B2 credentials are valid
- Check B2_ENDPOINT matches bucket region
- Ensure key has `listBucket` permission

### "ERROR: Failed to query D1 database"
- Verify Cloudflare API token has D1 access
- Check D1 database ID/name is correct
- Ensure wrangler is installed and accessible

### "ERROR: Failed to execute SQL against D1"
- Check D1 database has `photos` table
- Verify API token has write permissions
- Review generated SQL in dry-run mode

## References

- Problem statement: See PR description
- D1 schema: `migrations/0003_photos.sql`, `migrations/0007_photos_metadata.sql`
- Workflow: `.github/workflows/b2-d1-daily-sync.yml`
