-- 0029_member_sessions.sql
CREATE TABLE IF NOT EXISTS member_sessions (
  id           TEXT PRIMARY KEY,                  -- random token
  email        TEXT NOT NULL COLLATE NOCASE,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at   TEXT NOT NULL,                     -- datetime('now','+30 days')
  last_seen_at TEXT,
  ip           TEXT,
  ua           TEXT
);

CREATE INDEX IF NOT EXISTS idx_member_sessions_email ON member_sessions(email);
CREATE INDEX IF NOT EXISTS idx_member_sessions_expires ON member_sessions(expires_at);
