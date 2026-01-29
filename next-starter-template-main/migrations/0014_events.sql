-- 0014_events.sql
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  start_date TEXT NOT NULL, -- YYYY-MM-DD
  end_date TEXT,           -- optional
  location TEXT,
  host TEXT,
  fees TEXT,
  description TEXT,
  external_url TEXT,
  status TEXT NOT NULL DEFAULT 'posted', -- posted|hidden
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(status, start_date);
