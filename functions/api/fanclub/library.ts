import { requireMember } from '../../_lib/session';
import { jsonResponse, requireTables } from '../../_lib/d1';
import {
  countPublishedInventoryForSection,
  fetchLibraryInventoryPage,
  LIBRARY_SECTION,
  tableExists,
} from '../../_lib/content-inventory-public';

const PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
  const n = Number(raw || '1');
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export const onRequestGet = async (context: any): Promise<Response> => {
  const auth = await requireMember(context);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const tables = await requireTables(auth.db, ['content_inventory']);
    if (!tables.ok) return jsonResponse(tables.body, tables.status);

    const url = new URL(context.request.url);
    const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
    const page = parsePage(url.searchParams.get('page'));
    const offset = (page - 1) * PAGE_SIZE;

    const inventoryEligibleTotal = await countPublishedInventoryForSection(auth.db, LIBRARY_SECTION);

    if (inventoryEligibleTotal > 0) {
      const { items, total } = await fetchLibraryInventoryPage(auth.db, {
        q,
        limit: PAGE_SIZE,
        offset,
      });

      return new Response(
        JSON.stringify({ ok: true, items, page, page_size: PAGE_SIZE, total }, null, 2),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!(await tableExists(auth.db, 'library_entries'))) {
      return new Response(
        JSON.stringify({ ok: true, items: [], page, page_size: PAGE_SIZE, total: 0 }, null, 2),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const legacyWhere: string[] = [];
    const legacyArgs: any[] = [];
    if (q) {
      legacyWhere.push("(lower(COALESCE(title,'')) LIKE ? OR lower(COALESCE(content,'')) LIKE ?)");
      const like = `%${q}%`;
      legacyArgs.push(like, like);
    }
    const legacyWhereSql = legacyWhere.length ? `WHERE ${legacyWhere.join(' AND ')}` : '';

    const legacyCountRow = await auth.db
      .prepare(`SELECT COUNT(1) AS n FROM library_entries ${legacyWhereSql}`)
      .bind(...legacyArgs)
      .first();
    const legacyTotal = Number((legacyCountRow as any)?.n ?? 0) || 0;

    const legacyRows = await auth.db
      .prepare(
        `SELECT id, title, content, created_at
         FROM library_entries
         ${legacyWhereSql}
         ORDER BY created_at DESC, id DESC
         LIMIT ? OFFSET ?`,
      )
      .bind(...legacyArgs, PAGE_SIZE, offset)
      .all();

    const items = (legacyRows.results || []).map((row: any) => ({
      id: row.id,
      year: row.created_at ? Number(String(row.created_at).slice(0, 4)) || null : null,
      author: null,
      title: row.title || null,
      description: row.content ? String(row.content).slice(0, 100) : null,
      url: null,
      content: row.content || null,
    }));

    return new Response(
      JSON.stringify({ ok: true, items, page, page_size: PAGE_SIZE, total: legacyTotal }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
