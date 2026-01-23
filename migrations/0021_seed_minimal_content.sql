-- 0021_seed_minimal_content.sql
-- Minimal seed content to make the site feel alive on Day 1.
-- Safe: inserts only when tables are empty.

-- FAQ (public)
INSERT INTO faq (question, answer, created_at)
SELECT
  'What is the Lou Gehrig Fan Club?',
  'A community for fans to celebrate Lou Gehrig, share stories, and preserve history — built around "us", not transactions.',
  datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM faq);

-- Library (member area)
INSERT INTO library_entries (title, content, created_at)
SELECT
  'Getting Started in the Fan Club Library',
  'This is a starter entry. Replace with real Gehrig content during review phase.',
  datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM library_entries);

-- Friends (public section data)
INSERT INTO friends (name, url, description, created_at)
SELECT
  'Lou Gehrig Day',
  'https://www.mlb.com/news/lou-gehrig-day',
  'MLB’s annual day honoring Lou Gehrig and raising awareness for ALS.',
  datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM friends);

-- Milestones (public)
INSERT INTO milestones (title, body, year, created_at)
SELECT
  'Lou Gehrig Debuts for the Yankees',
  'A starter milestone entry (replace with curated timeline content).',
  1923,
  datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM milestones);
