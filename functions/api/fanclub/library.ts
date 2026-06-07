import { requireMember } from '../../_lib/session';
import { jsonResponse, requireTables } from '../../_lib/d1';

const PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
  const n = Number(raw || '1');
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function inventoryItem(row: any) {
  const eventYear = row.event_year ? Number(row.event_year) || null : null;
  const eventDateYear = row.event_date ? Number(String(row.event_date).slice(0, 4)) || null : null;

  return {
    id: row.id,
    year: eventYear || eventDateYear,
    author: row.credit_line || row.source_name || null,
    title: row.title || null,
    description: row.summary || (row.text ? String(row.text).slice(0, 100) : null),
    url: null,
    content: row.text || null,
    source: 'content_inventory',
  };
}

function legacyItem(row: any) {
  return {
    id: row.id,
    year: row.created_at ? Number(String(row.created_at).slice(0, 4)) || null : null,
    author: row.name || null,
    title: row.title || null,
    description: row.content ? String(row.content).slice(0, 100) : null,
    url: null,
    content: row.content || null,
    source: 'library_entries',
  };
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
    const tables = await requireTables(auth.db, ['content_inventory', 'library_entries']);
    if (!tables.ok) return jsonResponse(tables.body, tables.status);

    const url = new URL(context.request.url);
    const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
    const page = parsePage(url.searchParams.get('page'));
    const offset = (page - 1) * PAGE_SIZE;

    const where: string[] = [];
    const args: any[] = [];

    if (q) {
      where.push('(lower(COALESCE(title,\'\')) LIKE ? OR lower(COALESCE(summary,\'\')) LIKE ? OR lower(COALESCE(text,\'\')) LIKE ? OR lower(COALESCE(search_text,\'\')) LIKE ? OR lower(COALESCE(tag,\'\')) LIKE ? OR lower(COALESCE(source_name,\'\')) LIKE ? OR lower(COALESCE(credit_line,\'\')) LIKE ?)');
      const like = `%${q}%`;
      args.push(like, like, like, like, like, like, like);
    }

    where.push("status = 'published'");
    where.push("lower(COALESCE(allowed_sections,'')) LIKE '%library%'");

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRow = await auth.db
      .prepare(`SELECT COUNT(1) AS n FROM content_inventory ${whereSql}`)
      .bind(...args)
      .first();
    const total = Number((countRow as any)?.n ?? 0) || 0;

    const rows = await auth.db
      .prepare(
        `SELECT id, title, text, summary, credit_line, source_name, event_date, event_year, updated_at
         FROM content_inventory
         ${whereSql}
         ORDER BY priority DESC, updated_at DESC, id DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...args, PAGE_SIZE, offset)
      .all();

    const inventoryItems = (rows.results || []).map(inventoryItem);

    if (inventoryItems.length > 0 || total > 0) {
      return new Response(
        JSON.stringify({ ok: true, items: inventoryItems, page, page_size: PAGE_SIZE, total }, null, 2),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const legacyWhere: string[] = [];
    const legacyArgs: any[] = [];

    if (q) {
      legacyWhere.push('(lower(COALESCE(title,\'\')) LIKE ? OR lower(COALESCE(content,\'\')) LIKE ? OR lower(COALESCE(name,\'\')) LIKE ?)');
      const like = `%${q}%`;
      legacyArgs.push(like, like, like);
    }

    const legacyWhereSql = legacyWhere.length ? `WHERE ${legacyWhere.join(' AND ')}` : '';
    const legacyCountRow = await auth.db
      .prepare(`SELECT COUNT(1) AS n FROM library_entries ${legacyWhereSql}`)
      .bind(...legacyArgs)
      .first();
    const legacyTotal = Number((legacyCountRow as any)?.n ?? 0) || 0;

    const legacyRows = await auth.db
      .prepare(
        `SELECT id, name, title, content, created_at
         FROM library_entries
         ${legacyWhereSql}
         ORDER BY created_at DESC, id DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...legacyArgs, PAGE_SIZE, offset)
      .all();

    const items = (legacyRows.results || []).map(legacyItem);

    return new Response(
      JSON.stringify({ ok: true, items, page, page_size: PAGE_SIZE, total: legacyTotal, fallback: 'library_entries' }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
