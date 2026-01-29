-- Create table for mailing-list / join form submissions
CREATE TABLE IF NOT EXISTS join_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_join_requests_email
  ON join_requests (email);

CREATE INDEX IF NOT EXISTS idx_join_requests_created_at
  ON join_requests (created_at);
