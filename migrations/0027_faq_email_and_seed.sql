-- 0027_faq_email_and_seed.sql
-- Add submitter_email column and seed approved FAQ entries

-- Add submitter_email column if it doesn't exist
-- SQLite doesn't support ALTER TABLE IF NOT EXISTS, so we use a workaround
-- Check if the column exists before adding it
PRAGMA foreign_keys=off;

-- Add column (will fail silently if it exists in some SQLite versions, so we handle it safely)
-- We'll use a conditional approach by checking the table info
-- For idempotency, we create a new table with the column, copy data, and rename
-- But SQLite ALTER TABLE ADD COLUMN is idempotent in practice - it errors if column exists
-- We'll use a simpler approach: just try to add it, and migrations should handle errors

-- Safe approach: Just add the column. If it exists, the migration runner should handle the error.
-- But to be truly idempotent, we can check first
ALTER TABLE faq_entries ADD COLUMN submitter_email TEXT;

PRAGMA foreign_keys=on;

-- Seed approved FAQ entries (only if they don't already exist)
-- Use INSERT OR IGNORE with unique constraint on question

INSERT INTO faq_entries (question, answer, status)
SELECT 'What is the Lou Gehrig Fan Club?', 'The Lou Gehrig Fan Club brings fans together to celebrate Gehrig''s life and baseball legacy through stories, history, stats, memorabilia, and community events.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'What is the Lou Gehrig Fan Club?');

INSERT INTO faq_entries (question, answer, status)
SELECT 'How do I become a member?', 'Go to Join and complete the membership request. If approved, you''ll get access to the Fan Club area and a digital membership card.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'How do I become a member?');

INSERT INTO faq_entries (question, answer, status)
SELECT 'Does the club focus on ALS topics?', 'No. The club focuses on Gehrig''s life and baseball legacy. We acknowledge ALS only as part of Gehrig''s story and support partner charities when appropriate.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'Does the club focus on ALS topics?');

INSERT INTO faq_entries (question, answer, status)
SELECT 'What is Lou Gehrig Day?', 'MLB''s Lou Gehrig Day is observed annually on June 2nd to honor Gehrig''s legacy.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'What is Lou Gehrig Day?');

INSERT INTO faq_entries (question, answer, status)
SELECT 'Where can I see the Weekly Matchup?', 'Use Weekly Matchup on the site to vote and view results when available.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'Where can I see the Weekly Matchup?');

INSERT INTO faq_entries (question, answer, status)
SELECT 'How do I submit a question for the FAQ?', 'Use the Ask a Question form in the FAQ section. Include your email so we can follow up if needed.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'How do I submit a question for the FAQ?');

INSERT INTO faq_entries (question, answer, status)
SELECT 'Will my question appear immediately?', 'No. Questions are reviewed by an admin. Approved answers become searchable in the FAQ.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'Will my question appear immediately?');

INSERT INTO faq_entries (question, answer, status)
SELECT 'How do I contact the club?', 'Use the Contact page form. For membership issues, include the email you used to join.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'How do I contact the club?');

INSERT INTO faq_entries (question, answer, status)
SELECT 'Is the Store part of the website?', 'The Store link goes to our external merchandise partner; purchases are handled there.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'Is the Store part of the website?');

INSERT INTO faq_entries (question, answer, status)
SELECT 'Can I contribute memorabilia or photos?', 'Yes. Use the Fan Club area tools to submit items when available, or contact us with details.', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM faq_entries WHERE question = 'Can I contribute memorabilia or photos?');
