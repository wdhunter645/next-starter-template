-- Synthetic D1 export fixture for #2895 isolated restore proof.
-- Redacted / synthetic only. No Production data. No secrets.
-- Shape mirrors representative application tables used by media + catalog paths.

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_uid TEXT NOT NULL UNIQUE,
  b2_key TEXT NOT NULL,
  b2_file_id TEXT,
  size INTEGER NOT NULL,
  etag TEXT,
  ingested_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_assets_media_uid ON media_assets(media_uid);
CREATE INDEX IF NOT EXISTS idx_media_assets_b2_key ON media_assets(b2_key);

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  is_memorabilia INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO media_assets (media_uid, b2_key, b2_file_id, size, etag, ingested_at) VALUES
  ('uid-synthetic-001', 'photos/synthetic/lou-001.jpg', 'fileid-synth-001', 1024, 'etag-synth-001', '2026-08-01T12:00:00Z'),
  ('uid-synthetic-002', 'photos/synthetic/lou-002.jpg', 'fileid-synth-002', 2048, 'etag-synth-002', '2026-08-01T12:05:00Z'),
  ('uid-synthetic-003', 'memorabilia/synthetic/card-001.png', 'fileid-synth-003', 4096, 'etag-synth-003', '2026-08-01T12:10:00Z');

INSERT INTO photos (url, is_memorabilia, description, created_at) VALUES
  ('https://cdn.example.test/photos/synthetic/lou-001.jpg', 0, 'Synthetic photo 1', '2026-08-01T12:00:00Z'),
  ('https://cdn.example.test/photos/synthetic/lou-002.jpg', 0, 'Synthetic photo 2', '2026-08-01T12:05:00Z'),
  ('https://cdn.example.test/memorabilia/synthetic/card-001.png', 1, 'Synthetic memorabilia', '2026-08-01T12:10:00Z');

INSERT INTO members (email, display_name, created_at) VALUES
  ('synthetic.member@example.test', 'Synthetic Member', '2026-08-01T11:00:00Z');

COMMIT;
