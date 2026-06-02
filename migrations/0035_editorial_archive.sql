-- 0035_editorial_archive.sql
-- Editorial archive authority and member submission review queue.

CREATE TABLE IF NOT EXISTS content_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  media TEXT NOT NULL DEFAULT '[]',
  story_type TEXT NOT NULL DEFAULT 'brief' CHECK (story_type IN ('primary', 'secondary', 'brief')),
  allowed_sections TEXT NOT NULL DEFAULT '["library"]',
  priority INTEGER NOT NULL DEFAULT 0,
  search_text TEXT NOT NULL DEFAULT '',
  canonical INTEGER NOT NULL DEFAULT 1 CHECK (canonical IN (0, 1)),
  source_name TEXT,
  source_url TEXT,
  credit_line TEXT NOT NULL,
  event_date TEXT,
  rotation_group TEXT,
  last_featured TEXT,
  feature_weight INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  review_notes TEXT,
  submitted_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  published_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_inventory_canonical_tag
  ON content_inventory(tag)
  WHERE canonical = 1;

CREATE INDEX IF NOT EXISTS idx_content_inventory_status_priority
  ON content_inventory(status, priority DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_inventory_allowed_sections
  ON content_inventory(allowed_sections);

CREATE TABLE IF NOT EXISTS submission_queue (
  submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
  submitted_by TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_url TEXT,
  proposed_tag TEXT,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected_auto', 'rejected_manual')),
  review_notes TEXT,
  purge_flag INTEGER NOT NULL DEFAULT 0 CHECK (purge_flag IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  reviewed_at TEXT,
  reviewer TEXT
);

CREATE INDEX IF NOT EXISTS idx_submission_queue_status_created
  ON submission_queue(status, created_at DESC);
