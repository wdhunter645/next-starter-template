-- Add UNIQUE constraint to email column in join_requests table
-- This enforces idempotency at the database level

-- SQLite doesn't support ADD CONSTRAINT for UNIQUE, so we need to recreate the table
-- First, check if message column exists and add it if missing
-- (Migration 0001 doesn't have it, but 0004 does)

-- Create the new table with the UNIQUE constraint
CREATE TABLE IF NOT EXISTS join_requests_new (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  message     TEXT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Copy existing data (deduplicate by keeping the oldest entry per email)
-- Only copy columns that exist in the source table
INSERT INTO join_requests_new (id, name, email, created_at)
SELECT id, name, email, created_at
FROM join_requests
WHERE id IN (
  SELECT MIN(id)
  FROM join_requests
  GROUP BY LOWER(TRIM(email))
);

-- Drop the old table
DROP TABLE join_requests;

-- Rename the new table to the original name
ALTER TABLE join_requests_new RENAME TO join_requests;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_join_requests_email
  ON join_requests (email);

CREATE INDEX IF NOT EXISTS idx_join_requests_created_at
  ON join_requests (created_at);
