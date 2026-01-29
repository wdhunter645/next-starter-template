-- 0022_membership_card_content.sql
-- Canonical Membership Card content stored in D1 for admin editing.

CREATE TABLE IF NOT EXISTS membership_card_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT 'Membership Card',
  body_md TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'posted', -- posted|hidden
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_membership_card_status_updated
  ON membership_card_content(status, updated_at DESC);

-- Seed a default row if table is empty
INSERT INTO membership_card_content (title, body_md, status)
SELECT 'Membership Card',
       'This is the Membership Card instructions content.\n\nSource-of-truth reference: /docs/MembershipCard.MD\n',
       'posted'
WHERE NOT EXISTS (SELECT 1 FROM membership_card_content);
