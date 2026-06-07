-- 0036_content_inventory_schema_delta.sql
-- Task 002 content_inventory schema reconciliation.

ALTER TABLE content_inventory ADD COLUMN summary TEXT;
ALTER TABLE content_inventory ADD COLUMN perspective_label TEXT;
ALTER TABLE content_inventory ADD COLUMN event_year INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_inventory_canonical_tag
  ON content_inventory(tag)
  WHERE canonical = 1;

CREATE INDEX IF NOT EXISTS idx_content_inventory_event_year
  ON content_inventory(event_year);

CREATE TRIGGER IF NOT EXISTS trg_content_inventory_published_attribution_insert
BEFORE INSERT ON content_inventory
WHEN NEW.status = 'published'
  AND (
    trim(COALESCE(NEW.source_name, '')) = ''
    OR trim(COALESCE(NEW.credit_line, '')) = ''
  )
BEGIN
  SELECT RAISE(ABORT, 'published content_inventory rows require source_name and credit_line');
END;

CREATE TRIGGER IF NOT EXISTS trg_content_inventory_published_attribution_update
BEFORE UPDATE ON content_inventory
WHEN NEW.status = 'published'
  AND (
    trim(COALESCE(NEW.source_name, '')) = ''
    OR trim(COALESCE(NEW.credit_line, '')) = ''
  )
BEGIN
  SELECT RAISE(ABORT, 'published content_inventory rows require source_name and credit_line');
END;
