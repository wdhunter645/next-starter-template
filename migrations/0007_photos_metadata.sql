-- 0007_photos_metadata.sql
-- Expand photos schema to support rich metadata while remaining compatible with existing code.
-- Strategy: add columns (non-destructive) + add unique index on photo_id.

-- Ensure base table exists (older installs)
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  is_memorabilia INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Add new columns if missing (SQLite: safe guarded by try/catch pattern via separate statements)
ALTER TABLE photos ADD COLUMN photo_id TEXT;
ALTER TABLE photos ADD COLUMN title TEXT;
ALTER TABLE photos ADD COLUMN year INTEGER;
ALTER TABLE photos ADD COLUMN era TEXT;
ALTER TABLE photos ADD COLUMN type TEXT;
ALTER TABLE photos ADD COLUMN game_context TEXT;
ALTER TABLE photos ADD COLUMN location TEXT;
ALTER TABLE photos ADD COLUMN people TEXT;
ALTER TABLE photos ADD COLUMN teams TEXT;
ALTER TABLE photos ADD COLUMN tags TEXT;
ALTER TABLE photos ADD COLUMN source TEXT;
ALTER TABLE photos ADD COLUMN rights_notes TEXT;
ALTER TABLE photos ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE photos ADD COLUMN is_matchup_eligible INTEGER NOT NULL DEFAULT 0;

-- Create a unique index on photo_id for idempotent upserts.
CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_photo_id ON photos(photo_id);
