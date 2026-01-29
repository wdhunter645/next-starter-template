-- 0011_cms_content_blocks.sql
-- Purpose: Phase 2B — CMS Data Layer foundation
-- Creates content_blocks and content_revisions tables for Admin CMS

-- Content blocks table: stores current state of each editable CMS block
CREATE TABLE IF NOT EXISTS content_blocks (
  key TEXT PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft','published')),
  published_body_md TEXT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  published_at TEXT NULL,
  updated_by TEXT NOT NULL DEFAULT 'admin'
);

-- Indexes for content_blocks
CREATE INDEX IF NOT EXISTS idx_content_blocks_page ON content_blocks(page);
CREATE INDEX IF NOT EXISTS idx_content_blocks_status ON content_blocks(status);
CREATE INDEX IF NOT EXISTS idx_content_blocks_updated_at ON content_blocks(updated_at);

-- Content revisions table: stores historical versions of content blocks
CREATE TABLE IF NOT EXISTS content_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  version INTEGER NOT NULL,
  body_md TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

-- Index for content_revisions
CREATE INDEX IF NOT EXISTS idx_content_revisions_key_version ON content_revisions(key, version);
