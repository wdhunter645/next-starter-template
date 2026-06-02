import { requireMember } from '../../_lib/session';
import { jsonResponse, requireTables } from '../../_lib/d1';

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

    const where: string[] = [];
    const args: any[] = [];

    if (q) {
      where.push('(lower(COALESCE(title,\'\')) LIKE ? OR lower(COALESCE(text,\'\')) LIKE ? OR lower(COALESCE(search_text,\'\')) LIKE ? OR lower(COALESCE(credit_line,\'\')) LIKE ?)');
      const like = `%${q}%`;
      args.push(like, like, like, like);
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
        `SELECT id, title, text, credit_line, source_name, event_date, updated_at
         FROM content_inventory
         ${whereSql}
         ORDER BY priority DESC, updated_at DESC, id DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...args, PAGE_SIZE, offset)
      .all();

    const items = (rows.results || []).map((row: any) => ({
      id: row.id,
      year: row.event_date ? Number(String(row.event_date).slice(0, 4)) || null : null,
      author: row.credit_line || row.source_name || null,
      title: row.title || null,
      description: row.text ? String(row.text).slice(0, 100) : null,
      url: null,
      content: row.text || null,
    }));

    return new Response(
      JSON.stringify({ ok: true, items, page, page_size: PAGE_SIZE, total }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
