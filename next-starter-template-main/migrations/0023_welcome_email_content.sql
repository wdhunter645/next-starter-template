-- 0023_welcome_email_content.sql
-- Canonical Welcome Email top-half copy stored in D1 for admin editing.

CREATE TABLE IF NOT EXISTS welcome_email_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT 'Welcome Email',
  body_md TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'posted', -- posted|hidden
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_welcome_email_status_updated
  ON welcome_email_content(status, updated_at DESC);

-- Seed a default row if table is empty
INSERT INTO welcome_email_content (title, body_md, status)
SELECT 'Welcome Email',
       'This is the Welcome Email top-half copy.

Source-of-truth reference: /docs/WelcomeEmail.MD
',
       'posted'
WHERE NOT EXISTS (SELECT 1 FROM welcome_email_content);
