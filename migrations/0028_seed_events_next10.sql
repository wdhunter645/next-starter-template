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
  SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
)
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE status='posted' AND start_date >= date('now')
);
