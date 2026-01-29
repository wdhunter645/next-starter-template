-- lgfc_lite initial schema
PRAGMA foreign_keys = ON;

-- Mailing list / Join form submissions
CREATE TABLE IF NOT EXISTS join_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  message     TEXT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Fan library submissions (stories, content)
CREATE TABLE IF NOT EXISTS library_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  is_approved INTEGER NOT NULL DEFAULT 0
);

-- Photo catalog (archive + memorabilia)
CREATE TABLE IF NOT EXISTS photos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id       TEXT    NOT NULL UNIQUE, -- B2 file id or filename
  url            TEXT    NOT NULL,        -- Full public URL via Cloudflare/B2
  is_memorabilia INTEGER NOT NULL DEFAULT 0,
  description    TEXT,
  created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
