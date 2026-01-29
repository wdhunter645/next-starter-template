-- 0016_friends.sql
CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'charity', -- charity|business|sponsor
  blurb TEXT,
  url TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'posted', -- posted|hidden
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_friends_kind ON friends(status, kind, name);
