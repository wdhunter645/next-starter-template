-- 0018_matchups.sql
CREATE TABLE IF NOT EXISTS weekly_matchups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL, -- YYYY-MM-DD (Monday)
  photo_a_id INTEGER NOT NULL,
  photo_b_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active|closed
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_matchups_week ON weekly_matchups(week_start);

CREATE TABLE IF NOT EXISTS weekly_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL,
  choice TEXT NOT NULL, -- 'a'|'b'
  source_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_weekly_votes_week ON weekly_votes(week_start);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_votes_unique ON weekly_votes(week_start, source_hash);
