-- 0015_milestones.sql
CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  photo_id INTEGER, -- optional foreign to photos.id
  status TEXT NOT NULL DEFAULT 'posted', -- posted|hidden
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_milestones_year ON milestones(status, year);
