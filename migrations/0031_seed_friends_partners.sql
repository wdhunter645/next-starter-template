-- 0031_seed_friends_partners.sql
-- Seed initial "Friends of the Fan Club" partner tiles.
-- Idempotent: will not duplicate rows if re-run.

INSERT INTO friends (name, kind, blurb, url, status)
SELECT
  'Live Like Lou Foundation' AS name,
  'charity' AS kind,
  'Supporting ALS research and patient care in Lou Gehrig’s legacy.' AS blurb,
  'https://www.livelikelou.org' AS url,
  'posted' AS status
WHERE NOT EXISTS (SELECT 1 FROM friends WHERE url = 'https://www.livelikelou.org');

INSERT INTO friends (name, kind, blurb, url, status)
SELECT
  'ALS Cure Project' AS name,
  'charity' AS kind,
  'Accelerating ALS research toward effective treatments and a cure.' AS blurb,
  'https://www.alscure.org' AS url,
  'posted' AS status
WHERE NOT EXISTS (SELECT 1 FROM friends WHERE url = 'https://www.alscure.org');

INSERT INTO friends (name, kind, blurb, url, status)
SELECT
  'They Played In Color' AS name,
  'business' AS kind,
  'Celebrating baseball history and the stories that shaped the game.' AS blurb,
  'https://www.theyplayedincolor.com/' AS url,
  'posted' AS status
WHERE NOT EXISTS (SELECT 1 FROM friends WHERE url = 'https://www.theyplayedincolor.com/' OR url = 'https://www.theyplayedincolor.com');
