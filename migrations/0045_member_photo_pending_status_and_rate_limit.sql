-- 0045_member_photo_pending_status_and_rate_limit.sql
-- Task #3119 (#2857-002A): schema contract for member-photo pending/non-public
-- lifecycle and upload rate-limit persistence.
--
-- Additive only. No existing photos row changes meaning: DEFAULT 'published'
-- on the new status column preserves the current implicit behavior described
-- in functions/api/fanclub/photos.ts ("current schema does not have an
-- explicit approval column for photos. We treat current rows as
-- already-approved catalog content.").
--
-- No CHECK constraints are added on the new photos columns, matching the
-- existing photos table's own convention (0003/0007 have none) and avoiding
-- SQLite's narrower CHECK support on ALTER TABLE ADD COLUMN. Valid
-- status/consent_confirmed values are enforced at the API layer (#2899).

ALTER TABLE photos ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE photos ADD COLUMN submitted_by TEXT COLLATE NOCASE;
ALTER TABLE photos ADD COLUMN submitted_at TEXT;
ALTER TABLE photos ADD COLUMN quarantine_key TEXT;
ALTER TABLE photos ADD COLUMN consent_confirmed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE photos ADD COLUMN credit_line TEXT;
ALTER TABLE photos ADD COLUMN rights_owner TEXT;
ALTER TABLE photos ADD COLUMN moderation_notes TEXT;
ALTER TABLE photos ADD COLUMN reviewed_by TEXT COLLATE NOCASE;
ALTER TABLE photos ADD COLUMN reviewed_at TEXT;

CREATE INDEX IF NOT EXISTS idx_photos_status
  ON photos (status);

CREATE INDEX IF NOT EXISTS idx_photos_submitted_by
  ON photos (submitted_by);

-- Rate-limit persistence for photo upload attempts, mirroring the shape of
-- the repo's only existing rate-limit precedent (migrations/0012_login_attempts.sql).
-- Keyed primarily by member_email (not just ip) because photo upload is
-- already member-session-gated, unlike login which is pre-auth.
CREATE TABLE IF NOT EXISTS photo_upload_attempts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  member_email TEXT    NOT NULL COLLATE NOCASE,
  ip           TEXT    NOT NULL,
  ok           INTEGER NOT NULL,
  created_at   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photo_upload_attempts_member_email_created_at
  ON photo_upload_attempts (member_email, created_at);

CREATE INDEX IF NOT EXISTS idx_photo_upload_attempts_ip_created_at
  ON photo_upload_attempts (ip, created_at);
