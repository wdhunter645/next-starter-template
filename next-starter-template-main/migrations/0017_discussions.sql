-- 0017_discussions.sql
CREATE TABLE IF NOT EXISTS discussions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'posted' -- posted|hidden
);
CREATE INDEX IF NOT EXISTS idx_discussions_created ON discussions(status, created_at DESC);
