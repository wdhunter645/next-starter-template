-- 0033_ask_inbox.sql — visitor question intake (T22)
CREATE TABLE IF NOT EXISTS ask_inbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  screen_name TEXT,
  email TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ask_inbox_status_created
  ON ask_inbox(status, created_at DESC);
