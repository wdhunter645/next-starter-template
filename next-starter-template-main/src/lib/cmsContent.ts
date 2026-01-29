/**
 * cmsContent.ts
 * 
 * CMS read helper functions for content_blocks table
 * Compatible with Cloudflare Workers/Pages Functions runtime (D1)
 * 
 * Phase 2B — Server-side read helpers for Admin UI and page rendering
 */

// Type for Cloudflare D1 Database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D1Database = any;

export interface ContentBlock {
  key: string;
  page: string;
  section: string;
  title: string;
  status: 'draft' | 'published';
  version: number;
  body_md?: string;
  published_body_md?: string | null;
  published_at?: string | null;
  updated_at: string;
  updated_by?: string;
}

/**
 * Get all published blocks for a specific page
 * Returns only blocks with status='published' and includes published_body_md
 * 
 * @param db - D1 Database instance (env.DB in Cloudflare context)
 * @param page - Page identifier (e.g., 'home', 'about', 'charities')
 * @returns Array of published content blocks
 */
export async function getPublishedBlocksByPage(
  db: D1Database,
  page: string
): Promise<ContentBlock[]> {
  const stmt = db.prepare(`
    SELECT 
      key,
      page,
      section,
      title,
      status,
      version,
      published_body_md,
      published_at,
      updated_at
    FROM content_blocks
    WHERE page = ? AND status = 'published'
    ORDER BY section, key
  `).bind(page);

  const result = await stmt.all();
  return (result.results || []) as ContentBlock[];
}

/**
 * Get all blocks for a specific page (all statuses)
 * Used for admin listing and preview
 * 
 * @param db - D1 Database instance (env.DB in Cloudflare context)
 * @param page - Page identifier (e.g., 'home', 'about', 'charities')
 * @returns Array of content blocks (draft and published)
 */
export async function getDraftBlocksByPage(
  db: D1Database,
  page: string
): Promise<ContentBlock[]> {
  const stmt = db.prepare(`
    SELECT 
      key,
      page,
      section,
      title,
      status,
      version,
      body_md,
      published_body_md,
      published_at,
      updated_at,
      updated_by
    FROM content_blocks
    WHERE page = ?
    ORDER BY section, key
  `).bind(page);

  const result = await stmt.all();
  return (result.results || []) as ContentBlock[];
}

/**
 * Get a single content block by key
 * Returns full block data including both body_md and published_body_md
 * 
 * @param db - D1 Database instance (env.DB in Cloudflare context)
 * @param key - Block key (e.g., 'home.hero.primary')
 * @returns Content block or null if not found
 */
export async function getBlockByKey(
  db: D1Database,
  key: string
): Promise<ContentBlock | null> {
  const stmt = db.prepare(`
    SELECT 
      key,
      page,
      section,
      title,
      status,
      version,
      body_md,
      published_body_md,
      published_at,
      updated_at,
      updated_by
    FROM content_blocks
    WHERE key = ?
  `).bind(key);

  const result = await stmt.first();
  return result as ContentBlock | null;
}
