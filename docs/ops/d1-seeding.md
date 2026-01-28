# D1 Database Seeding

## Overview

The D1 seeding infrastructure populates all database tables with deterministic pseudo-data for development and testing. This ensures every D1-backed UI section has realistic data to load, preventing empty states from masking broken queries.

## Quick Start

### Seed Local D1 Database

```bash
# Full bootstrap (migrations + seed)
./scripts/d1-seed-all.sh

# Or just run seed (assumes migrations already applied)
node scripts/d1-seed-all.mjs
```

### Seed Production Environment

```bash
# Full bootstrap for production
./scripts/d1-seed-all.sh production

# Or just seed production
node scripts/d1-seed-all.mjs --env production
```

## What Gets Seeded

The seed script populates all D1 tables with the following minimum row counts:

- **photos**: 50 rows (uses Wikimedia Commons Lou Gehrig images)
- **members**: 20 rows (realistic member accounts)
- **events**: 25 rows (calendar entries)
- **milestones**: 25 rows (historical timeline)
- **faq_entries**: 20 rows (FAQ list)
- **discussions**: 15 rows (forum topics)
- **weekly_votes**: 30 rows (matchup voting data)
- **All other tables**: 15 rows (minimum viable data)

## Idempotency

The seed script is **idempotent** - it can be run multiple times safely:

- Checks current row count before inserting
- Only inserts rows if below target count
- Uses deterministic pseudo-data generation
- Safe to run after migrations

## Verification

After seeding, verify table counts:

```bash
# Generate row count report
./scripts/d1-report.sh

# Or view in admin UI (requires admin token)
# Visit: /admin/d1-test
```

The `/admin/d1-test` page shows:
- Row count for all tables
- Table schemas
- Sample rows for inspection

## Data Generation

The seed script uses:

- **Wikimedia Commons URLs** for photo/media columns (publicly available Lou Gehrig images)
- **Deterministic UUIDs** generated from table name + column + row index
- **Context-specific values** for known columns (e.g., event locations, milestone titles)
- **Foreign key awareness** - seeds parent tables before child tables
- **Date spreading** - events distributed across months, not clustered

## Troubleshooting

### No tables found

Ensure migrations are applied first:

```bash
npx wrangler d1 migrations apply lgfc_lite --local
```

### Foreign key errors

The seed script uses topological sort to seed parent tables first. If you still see FK errors, check that:
- Migrations are fully applied
- Referenced tables exist
- Parent tables have data

### Wrangler errors

Ensure you have the latest wrangler:

```bash
npm install -g wrangler@latest
```

## Implementation Files

- **`scripts/d1-seed-all.mjs`** - Main seeding logic (programmatic)
- **`scripts/d1-seed-all.sh`** - Wrapper script (migrations + seed + report)
- **`scripts/d1-report.sh`** - Row count reporting
- **`migrations/0026_seed_weekly_matchup.sql`** - Migration-based matchup seed

## Maintenance

When adding new tables:

1. Create migration file in `migrations/`
2. No changes needed to seed script (auto-discovers tables)
3. Optionally add table to `TABLE_MIN_ROWS` in `d1-seed-all.mjs` if it needs >15 rows
4. Optionally add custom value generation for specific columns

## Weekly Matchup Data

The Weekly Photo Matchup requires:
- At least 2 photos in the `photos` table
- At least 1 active matchup in `weekly_matchups` table
- Optional: votes in `weekly_votes` table

This is automatically seeded by:
- `scripts/d1-seed-all.mjs` (50 photos, votes)
- `migrations/0026_seed_weekly_matchup.sql` (ensures 1 active matchup)
