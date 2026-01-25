-- Create table for fan-submitted library entries
CREATE TABLE IF NOT EXISTS library_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_library_entries_created_at
  ON library_entries (created_at);
