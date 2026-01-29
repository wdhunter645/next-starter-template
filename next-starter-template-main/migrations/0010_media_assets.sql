-- 0010_media_assets.sql
-- Create media_assets table for B2 → D1 ingestion pipeline
-- This table tracks all media files from B2 bucket with deterministic, stable identifiers

CREATE TABLE IF NOT EXISTS media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_uid TEXT NOT NULL UNIQUE,
  b2_key TEXT NOT NULL,
  b2_file_id TEXT,
  size INTEGER NOT NULL,
  etag TEXT,
  ingested_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create unique index on media_uid for idempotent inserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_assets_media_uid ON media_assets(media_uid);

-- Create index on b2_key for lookups
CREATE INDEX IF NOT EXISTS idx_media_assets_b2_key ON media_assets(b2_key);

-- Create index on ingested_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_media_assets_ingested_at ON media_assets(ingested_at);
