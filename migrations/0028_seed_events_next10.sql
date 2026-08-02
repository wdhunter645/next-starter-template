-- 0028_seed_events_next10.sql
-- Goal: make "next 10 events" work day-1 with no auth, no manual seeding.
-- Rule: only seed if there are ZERO posted events starting today or later.

INSERT INTO events (title, start_date, end_date, location, host, fees, description, external_url, status)
SELECT
  'LGFC Placeholder Event ' || printf('%02d', n) AS title,
  date('now', '+' || n || ' day')               AS start_date,
  date('now', '+' || n || ' day')               AS end_date,
  'LGFC'                                        AS location,
  'Fan Club'                                    AS host,
  'Free'                                        AS fees,
  'Placeholder event for calendar display (replace with real content later).' AS description,
  'https://www.lougehrigfanclub.com'            AS external_url,
  'posted'                                      AS status
FROM (
  -- D1's compound-SELECT term limit (5) is lower than stock SQLite's default (500),
  -- so the 10-term UNION ALL chain this migration originally used fails on D1 with
  -- "too many terms in compound SELECT". VALUES avoids compound-select parsing.
  SELECT column1 AS n FROM (VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10))
)
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE status='posted' AND start_date >= date('now')
);
