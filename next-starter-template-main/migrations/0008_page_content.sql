-- 0008_page_content.sql
-- Purpose: Enable DB-backed editable copy blocks per page/section (Gap 1).

CREATE TABLE IF NOT EXISTS page_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,                 -- e.g. '/', '/about'
  section TEXT NOT NULL,              -- e.g. 'title', 'lead_html', 'body_html'
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('draft','live')),
  content TEXT,                       -- HTML (or plain text) for rendering
  asset_url TEXT,                     -- optional image URL for section
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_page_content_unique
ON page_content (slug, section, status);

CREATE TABLE IF NOT EXISTS page_content_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  section TEXT NOT NULL,
  status TEXT NOT NULL,
  content TEXT,
  asset_url TEXT,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_by TEXT
);

-- Lightweight view for live content (handy for debugging)
CREATE VIEW IF NOT EXISTS v_page_content_live AS
SELECT slug, section, content, asset_url, updated_at
FROM page_content
WHERE status = 'live';
