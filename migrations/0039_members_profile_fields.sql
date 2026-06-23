-- 0039_members_profile_fields.sql
-- Store editable member profile fields on members per design reconciliation (B-001).

ALTER TABLE members ADD COLUMN first_name TEXT;
ALTER TABLE members ADD COLUMN last_name TEXT;
ALTER TABLE members ADD COLUMN screen_name TEXT;
ALTER TABLE members ADD COLUMN email_opt_in INTEGER NOT NULL DEFAULT 1;

-- Backfill from join_requests where members row exists without profile fields.
UPDATE members
SET first_name = (
      SELECT jr.first_name FROM join_requests jr
      WHERE lower(jr.email) = lower(members.email) AND jr.first_name IS NOT NULL
      LIMIT 1
    ),
    last_name = (
      SELECT jr.last_name FROM join_requests jr
      WHERE lower(jr.email) = lower(members.email) AND jr.last_name IS NOT NULL
      LIMIT 1
    ),
    screen_name = (
      SELECT jr.screen_name FROM join_requests jr
      WHERE lower(jr.email) = lower(members.email) AND jr.screen_name IS NOT NULL
      LIMIT 1
    ),
    email_opt_in = COALESCE((
      SELECT jr.email_opt_in FROM join_requests jr
      WHERE lower(jr.email) = lower(members.email)
      LIMIT 1
    ), 1)
WHERE first_name IS NULL OR last_name IS NULL;
