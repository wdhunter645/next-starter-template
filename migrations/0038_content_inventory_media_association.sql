-- 0038_content_inventory_media_association.sql
-- Task 004: story-media association with photos and attribution metadata.

CREATE TABLE IF NOT EXISTS content_inventory_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  media_role TEXT NOT NULL CHECK (
    media_role IN (
      'primary_image',
      'gallery_image',
      'ocr_source',
      'newspaper_source',
      'memorabilia_reference',
      'supporting_image'
    )
  ),
  display_order INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  alt_text TEXT,
  source_name TEXT,
  source_url TEXT,
  credit_line TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (story_id) REFERENCES content_inventory(id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES photos(id) ON DELETE RESTRICT,
  UNIQUE (story_id, media_id, media_role)
);

CREATE INDEX IF NOT EXISTS idx_content_inventory_media_story_order
  ON content_inventory_media(story_id, display_order ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_content_inventory_media_media_id
  ON content_inventory_media(media_id);

-- Backfill association rows from legacy content_inventory.media JSON when a photo URL matches.
INSERT INTO content_inventory_media (
  story_id,
  media_id,
  media_role,
  display_order,
  alt_text,
  source_name,
  source_url,
  credit_line,
  created_at,
  updated_at
)
SELECT
  ci.id,
  p.id,
  'supporting_image',
  0,
  COALESCE(NULLIF(trim(p.description), ''), 'Historical photo'),
  ci.source_name,
  COALESCE(ci.source_url, p.url),
  ci.credit_line,
  ci.updated_at,
  ci.updated_at
FROM content_inventory ci
JOIN photos p ON lower(trim(p.url)) = lower(trim(json_extract(ci.media, '$[0].url')))
WHERE json_array_length(ci.media) > 0
  AND json_extract(ci.media, '$[0].url') IS NOT NULL
  AND trim(json_extract(ci.media, '$[0].url')) <> ''
  AND NOT EXISTS (
    SELECT 1
      FROM content_inventory_media existing
     WHERE existing.story_id = ci.id
       AND existing.media_id = p.id
  );
