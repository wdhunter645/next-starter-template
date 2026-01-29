-- Members table with role support
CREATE TABLE IF NOT EXISTS members (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  role        TEXT    NOT NULL DEFAULT 'member',  -- 'member' or 'admin'
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Seed admin members (idempotent - only inserts if not exists)
INSERT OR IGNORE INTO members (email, role) VALUES ('billhunter71@gmail.com', 'admin');
INSERT OR IGNORE INTO members (email, role) VALUES ('lougehrigfanclub@gmail.com', 'admin');
