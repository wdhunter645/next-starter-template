-- Migration: Add UNIQUE constraint on email (normalized) for join_requests
-- Ensures DB-level idempotency for join submissions

-- Step 1: Normalize existing emails (lowercase + trim)
-- SQLite doesn't have UPDATE with FROM, so we update in place
UPDATE join_requests
SET email = LOWER(TRIM(email))
WHERE email != LOWER(TRIM(email));

-- Step 2: Remove any exact duplicates that may exist (keep oldest)
-- This ensures the UNIQUE constraint won't fail on existing data
DELETE FROM join_requests
WHERE id NOT IN (
  SELECT MIN(id)
  FROM join_requests
  GROUP BY email
);

-- Step 3: Create UNIQUE index on email column
-- This enforces idempotency at the DB level
CREATE UNIQUE INDEX IF NOT EXISTS idx_join_requests_email_unique
  ON join_requests (email);
