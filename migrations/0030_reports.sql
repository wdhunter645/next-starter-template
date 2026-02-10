-- 0030_reports.sql
CREATE TABLE IF NOT EXISTS reports (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  kind           TEXT NOT NULL,          -- discussion|photo|library|memorabilia
  target_id      INTEGER NOT NULL,
  reporter_email TEXT COLLATE NOCASE,
  reason         TEXT,
  status         TEXT NOT NULL DEFAULT 'open', -- open|closed
  admin_note     TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_kind_target ON reports(kind, target_id);
