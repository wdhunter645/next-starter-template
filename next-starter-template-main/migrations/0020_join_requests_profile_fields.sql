-- 0020_join_requests_profile_fields.sql
-- Add profile fields to join_requests to match design locks.
-- Non-destructive: add columns; existing rows retain original name field.

ALTER TABLE join_requests ADD COLUMN first_name TEXT;
ALTER TABLE join_requests ADD COLUMN last_name TEXT;
ALTER TABLE join_requests ADD COLUMN screen_name TEXT;
ALTER TABLE join_requests ADD COLUMN email_opt_in INTEGER NOT NULL DEFAULT 1;
ALTER TABLE join_requests ADD COLUMN profile_photo_id INTEGER; -- optional FK to photos.id (enforced at app level)
ALTER TABLE join_requests ADD COLUMN presence_status TEXT NOT NULL DEFAULT 'Inactive' CHECK (presence_status IN ('Active','Inactive'));
ALTER TABLE join_requests ADD COLUMN presence_updated_at TEXT;

CREATE INDEX IF NOT EXISTS idx_join_requests_presence ON join_requests(presence_status, presence_updated_at);
