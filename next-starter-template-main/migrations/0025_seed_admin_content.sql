-- 0025_seed_admin_content.sql
-- Seed initial admin-managed content if empty.

INSERT INTO membership_card_content (title, body_md, status, updated_at)
SELECT 'Membership Card',
       'This section is admin-managed.\n\nPublish the official Membership Card content from /admin.\n\nOnce published, members will see it on /member/card.',
       'posted',
       datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM membership_card_content);

INSERT INTO welcome_email_content (title, body_md, status, updated_at)
SELECT 'Welcome Email',
       'Thanks for joining the Lou Gehrig Fan Club mailing list.\n\nYou’ll get periodic updates about new content, milestones, events, and ways to support ALS charities.\n\nIf you ever want to stop receiving messages, reply to this email and we’ll remove you.',
       'posted',
       datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM welcome_email_content);

INSERT INTO footer_quotes (quote, attribution, status, created_at, updated_at)
SELECT 'I consider myself the luckiest man on the face of the earth.', 'Lou Gehrig', 'posted', datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM footer_quotes);
