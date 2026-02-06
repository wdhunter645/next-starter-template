-- 0028_faq_view_count_and_pinned.sql
-- Add view_count and pinned columns to faq_entries for FAQ rebuild feature

-- Add view_count column (tracks clicks/views on FAQ items)
ALTER TABLE faq_entries ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Add pinned column (0 = not pinned, 1 = pinned)
-- Pinned FAQs appear first in Top FAQs list
ALTER TABLE faq_entries ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0;
