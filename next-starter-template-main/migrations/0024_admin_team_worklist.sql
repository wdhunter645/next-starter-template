-- 0024_admin_team_worklist.sql
-- Admin Team Worklist (design lock section #9)

CREATE TABLE IF NOT EXISTS admin_team_worklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task TEXT NOT NULL,
  date_opened TEXT NOT NULL DEFAULT (date('now')),
  needed_completion_date TEXT,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open|in_progress|completed
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_worklist_status_needed
  ON admin_team_worklist(status, needed_completion_date);
