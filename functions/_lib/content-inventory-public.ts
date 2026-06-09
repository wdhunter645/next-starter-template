// Shared read helpers for published content_inventory public/member surfaces.

export const LIBRARY_SECTION = 'library';
export const RELATED_CONTENT_SECTION = 'related_content';

export type PublicInventoryStory = {
  id: number;
  title: string | null;
  excerpt: string | null;
  summary: string | null;
  author: string | null;
  year: number | null;
  tag: string | null;
  perspective_label: string | null;
  canonical: boolean;
};

export type RelatedStoriesResult = {
  items: PublicInventoryStory[];
  source: 'content_inventory' | 'library_entries';
};

type InventoryRow = Record<string, unknown>;

export function parseInventoryYear(eventYear: unknown, eventDate: unknown): number | null {
  if (eventYear !== null && eventYear !== undefined && String(eventYear).trim() !== '') {
    const parsed = Number(eventYear);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return eventDate ? Number(String(eventDate).slice(0, 4)) || null : null;
}

export function sectionAllowedClause(sectionKey: string): string {
  const escaped = sectionKey.replace(/'/g, "''");
  return `lower(COALESCE(allowed_sections,'')) LIKE '%${escaped}%'`;
}

export function publishedInventoryWhere(sectionKey: string): string {
  return `status = 'published' AND ${sectionAllowedClause(sectionKey)} AND COALESCE(TRIM(source_name), '') != '' AND COALESCE(TRIM(credit_line), '') != ''`;
}

export function mapPublicInventoryStory(row: InventoryRow): PublicInventoryStory {
  const text = typeof row.text === 'string' ? row.text : '';
  const summary = typeof row.summary === 'string' ? row.summary.trim() : '';
  return {
    id: Number(row.id),
    title: typeof row.title === 'string' ? row.title : null,
    excerpt: summary || (text ? text.slice(0, 160) : null),
    summary: summary || null,
    author:
      (typeof row.credit_line === 'string' && row.credit_line.trim()) ||
      (typeof row.source_name === 'string' && row.source_name.trim()) ||
      null,
    year: parseInventoryYear(row.event_year, row.event_date),
    tag: typeof row.tag === 'string' ? row.tag : null,
    perspective_label: typeof row.perspective_label === 'string' ? row.perspective_label : null,
    canonical: Number(row.canonical) === 1,
  };
}

export function mapLibraryInventoryItem(row: InventoryRow) {
  return {
    id: Number(row.id),
    year: parseInventoryYear(row.event_year, row.event_date),
    author:
      (typeof row.credit_line === 'string' && row.credit_line.trim()) ||
      (typeof row.source_name === 'string' && row.source_name.trim()) ||
      null,
    title: typeof row.title === 'string' ? row.title : null,
    description:
      (typeof row.summary === 'string' && row.summary.trim()) ||
      (typeof row.text === 'string' && row.text ? row.text.slice(0, 100) : null),
    url: null,
    content: typeof row.text === 'string' ? row.text : null,
    created_at: typeof row.updated_at === 'string' ? row.updated_at : null,
  };
}

export async function tableExists(db: any, table: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ? LIMIT 1")
    .bind(table)
    .first();
  return Boolean((row as { name?: string } | null)?.name);
}

export async function countPublishedInventoryForSection(db: any, sectionKey: string): Promise<number> {
  const row = await db
    .prepare(`SELECT COUNT(1) AS n FROM content_inventory WHERE ${publishedInventoryWhere(sectionKey)}`)
    .first();
  return Number((row as { n?: number } | null)?.n ?? 0) || 0;
}

type FetchLibraryInventoryOptions = {
  q?: string;
  limit: number;
  offset: number;
};

export async function fetchLibraryInventoryPage(
  db: any,
  options: FetchLibraryInventoryOptions,
): Promise<{ items: ReturnType<typeof mapLibraryInventoryItem>[]; total: number }> {
  const q = String(options.q || '').trim().toLowerCase();
  const whereParts = [publishedInventoryWhere(LIBRARY_SECTION)];
  const args: unknown[] = [];

  if (q) {
    whereParts.push(
      "(lower(COALESCE(title,'')) LIKE ? OR lower(COALESCE(text,'')) LIKE ? OR lower(COALESCE(summary,'')) LIKE ? OR lower(COALESCE(search_text,'')) LIKE ? OR lower(COALESCE(credit_line,'')) LIKE ? OR lower(COALESCE(source_name,'')) LIKE ? OR lower(COALESCE(perspective_label,'')) LIKE ?)",
    );
    const like = `%${q}%`;
    args.push(like, like, like, like, like, like, like);
  }

  const whereSql = `WHERE ${whereParts.join(' AND ')}`;
  const countRow = await db.prepare(`SELECT COUNT(1) AS n FROM content_inventory ${whereSql}`).bind(...args).first();
  const total = Number((countRow as { n?: number } | null)?.n ?? 0) || 0;

  const rows = await db
    .prepare(
      `SELECT id, title, text, summary, credit_line, source_name, event_date, event_year, updated_at
       FROM content_inventory
       ${whereSql}
       ORDER BY priority DESC, updated_at DESC, id DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(...args, options.limit, options.offset)
    .all();

  const items = ((rows.results ?? []) as InventoryRow[]).map((row) => mapLibraryInventoryItem(row));
  return { items, total };
}

export type FetchRelatedInventoryOptions = {
  q?: string;
  tag?: string;
  eventYear?: number | null;
  rotationGroup?: string;
  excludeId?: number;
  limit?: number;
};

export async function fetchRelatedInventoryStories(
  db: any,
  options: FetchRelatedInventoryOptions,
): Promise<PublicInventoryStory[]> {
  const limit = Math.max(1, Math.min(20, Number(options.limit ?? 5) || 5));
  const whereParts = [publishedInventoryWhere(RELATED_CONTENT_SECTION)];
  const args: unknown[] = [];

  const q = String(options.q || '').trim().toLowerCase();
  if (q) {
    whereParts.push(
      "(lower(COALESCE(title,'')) LIKE ? OR lower(COALESCE(text,'')) LIKE ? OR lower(COALESCE(summary,'')) LIKE ? OR lower(COALESCE(search_text,'')) LIKE ? OR lower(COALESCE(tag,'')) LIKE ?)",
    );
    const like = `%${q}%`;
    args.push(like, like, like, like, like);
  }

  const tag = String(options.tag || '').trim();
  if (tag) {
    whereParts.push('lower(COALESCE(tag,\'\')) = ?');
    args.push(tag.toLowerCase());
  }

  if (options.eventYear !== null && options.eventYear !== undefined && Number.isFinite(options.eventYear)) {
    whereParts.push('event_year = ?');
    args.push(Math.trunc(Number(options.eventYear)));
  }

  const rotationGroup = String(options.rotationGroup || '').trim();
  if (rotationGroup) {
    whereParts.push('lower(COALESCE(rotation_group,\'\')) = ?');
    args.push(rotationGroup.toLowerCase());
  }

  if (typeof options.excludeId === 'number' && Number.isFinite(options.excludeId)) {
    whereParts.push('id != ?');
    args.push(options.excludeId);
  }

  const whereSql = `WHERE ${whereParts.join(' AND ')}`;
  const rows = await db
    .prepare(
      `SELECT id, tag, title, text, summary, credit_line, source_name, event_date, event_year,
              perspective_label, canonical, priority, updated_at
       FROM content_inventory
       ${whereSql}
       ORDER BY canonical DESC, priority DESC, updated_at DESC, id DESC
       LIMIT ?`,
    )
    .bind(...args, limit)
    .all();

  return ((rows.results ?? []) as InventoryRow[]).map((row) => mapPublicInventoryStory(row));
}

export async function fetchLegacyLibraryRelated(
  db: any,
  options: { q?: string; limit?: number },
): Promise<PublicInventoryStory[]> {
  if (!(await tableExists(db, 'library_entries'))) return [];

  const limit = Math.max(1, Math.min(20, Number(options.limit ?? 5) || 5));
  const q = String(options.q || '').trim().toLowerCase();
  const rows = await db
    .prepare(
      q
        ? `SELECT id, title, content
           FROM library_entries
           WHERE lower(COALESCE(title,'')) LIKE ? OR lower(COALESCE(content,'')) LIKE ?
           ORDER BY created_at DESC, id DESC
           LIMIT ?`
        : `SELECT id, title, content
           FROM library_entries
           ORDER BY created_at DESC, id DESC
           LIMIT ?`,
    )
    .bind(...(q ? [`%${q}%`, `%${q}%`, limit] : [limit]))
    .all();

  return ((rows.results ?? []) as InventoryRow[]).map((row) => ({
    id: Number(row.id),
    title: typeof row.title === 'string' ? row.title : null,
    excerpt: typeof row.content === 'string' ? row.content.slice(0, 160) : null,
    summary: null,
    author: null,
    year: null,
    tag: null,
    perspective_label: null,
    canonical: true,
  }));
}

export async function resolveRelatedStories(
  db: any,
  options: FetchRelatedInventoryOptions,
): Promise<RelatedStoriesResult> {
  if (!(await tableExists(db, 'content_inventory'))) {
    const legacyItems = await fetchLegacyLibraryRelated(db, options);
    return { items: legacyItems, source: 'library_entries' };
  }

  const eligibleCount = await countPublishedInventoryForSection(db, RELATED_CONTENT_SECTION);
  if (eligibleCount > 0) {
    const items = await fetchRelatedInventoryStories(db, options);
    return { items, source: 'content_inventory' };
  }

  const legacyItems = await fetchLegacyLibraryRelated(db, options);
  return { items: legacyItems, source: 'library_entries' };
}

export function toLegacyRelatedLibraryEntries(items: PublicInventoryStory[]) {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
  }));
}
