-- 0021_footer_quotes.sql
-- Rotating footer quotes (admin-managed).

CREATE TABLE IF NOT EXISTS footer_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote TEXT NOT NULL,
  attribution TEXT,
  status TEXT NOT NULL DEFAULT 'posted', -- posted|hidden
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_footer_quotes_status_updated
  ON footer_quotes(status, updated_at DESC);

-- Seed a minimal starter set (idempotent)
INSERT OR IGNORE INTO footer_quotes (id, quote, attribution, status)
VALUES
  (1, 'I consider myself the luckiest man on the face of the earth.', 'Lou Gehrig', 'posted'),
  (2, 'Today, I consider myself the luckiest man on the face of the earth.', 'Lou Gehrig', 'posted');
