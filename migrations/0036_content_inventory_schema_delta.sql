-- 0036_content_inventory_schema_delta.sql
-- Task 002: reconcile approved content_inventory schema fields and publish attribution guardrails.

ALTER TABLE content_inventory ADD COLUMN summary TEXT;
ALTER TABLE content_inventory ADD COLUMN perspective_label TEXT;
ALTER TABLE content_inventory ADD COLUMN event_year INTEGER;

CREATE TRIGGER IF NOT EXISTS trg_content_inventory_publish_attribution_insert
BEFORE INSERT ON content_inventory
WHEN NEW.status = 'published'
  AND (
    trim(COALESCE(NEW.source_name, '')) = ''
    OR trim(COALESCE(NEW.credit_line, '')) = ''
  )
BEGIN
  SELECT RAISE(ABORT, 'published content_inventory records require source_name and credit_line');
END;

CREATE TRIGGER IF NOT EXISTS trg_content_inventory_publish_attribution_update
BEFORE UPDATE OF status, source_name, credit_line ON content_inventory
WHEN NEW.status = 'published'
  AND (
    trim(COALESCE(NEW.source_name, '')) = ''
    OR trim(COALESCE(NEW.credit_line, '')) = ''
  )
BEGIN
  SELECT RAISE(ABORT, 'published content_inventory records require source_name and credit_line');
END;
