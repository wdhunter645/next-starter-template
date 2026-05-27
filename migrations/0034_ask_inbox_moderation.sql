-- 0034_ask_inbox_moderation.sql — T23 ask inbox moderation fields
ALTER TABLE ask_inbox ADD COLUMN moderation_note TEXT;
ALTER TABLE ask_inbox ADD COLUMN faq_entry_id INTEGER;
