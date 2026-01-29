-- 0026_seed_weekly_matchup.sql
-- Ensure there is at least one active weekly matchup for the current week if photos exist.
-- Safe to run repeatedly.

-- Week start (Monday) approximation:
-- 'weekday 1' moves to next Monday; subtract 7 days yields last Monday (or today if Monday).
WITH ws AS (
  SELECT date('now','weekday 1','-7 days') AS week_start
),
picks AS (
  SELECT
    (SELECT id FROM photos ORDER BY id DESC LIMIT 1 OFFSET 1) AS photo_a_id,
    (SELECT id FROM photos ORDER BY id DESC LIMIT 1 OFFSET 0) AS photo_b_id
),
can_seed AS (
  SELECT
    ws.week_start AS week_start,
    picks.photo_a_id AS photo_a_id,
    picks.photo_b_id AS photo_b_id
  FROM ws, picks
  WHERE picks.photo_a_id IS NOT NULL AND picks.photo_b_id IS NOT NULL
),
missing AS (
  SELECT 1 AS ok
  FROM can_seed
  WHERE NOT EXISTS (
    SELECT 1 FROM weekly_matchups WHERE week_start = can_seed.week_start
  )
)
INSERT INTO weekly_matchups (week_start, photo_a_id, photo_b_id, status)
SELECT can_seed.week_start, can_seed.photo_a_id, can_seed.photo_b_id, 'active'
FROM can_seed, missing;
