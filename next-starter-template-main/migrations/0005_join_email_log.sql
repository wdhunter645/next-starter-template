-- Join email delivery audit log (Phase 6 polish)
-- One row per attempted email (welcome/admin) per join request.

CREATE TABLE IF NOT EXISTS join_email_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id      TEXT    NOT NULL,
  message_type    TEXT    NOT NULL, -- 'welcome' | 'admin'
  recipient_email TEXT    NOT NULL,
  result          TEXT    NOT NULL, -- 'sent' | 'failed' | 'skipped'
  provider        TEXT    NOT NULL,
  status_code     INTEGER,
  error           TEXT,
  created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_join_email_log_request_id
  ON join_email_log (request_id);

CREATE INDEX IF NOT EXISTS idx_join_email_log_created_at
  ON join_email_log (created_at);

CREATE INDEX IF NOT EXISTS idx_join_email_log_result
  ON join_email_log (result);
