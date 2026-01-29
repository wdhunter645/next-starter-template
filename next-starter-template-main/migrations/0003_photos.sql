-- Create table for photo archive + memorabilia
CREATE TABLE IF NOT EXISTS photos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  url            TEXT    NOT NULL,
  is_memorabilia INTEGER NOT NULL DEFAULT 0,
  description    TEXT,
  created_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_created_at
  ON photos (created_at);

CREATE INDEX IF NOT EXISTS idx_photos_is_memorabilia
  ON photos (is_memorabilia);
