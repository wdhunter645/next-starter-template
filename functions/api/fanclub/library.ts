import { requireMember } from '../../_lib/session';
import { jsonResponse, requireTables } from '../../_lib/d1';

const PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
  const n = Number(raw || '1');
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

async function tableExists(db: any, table: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ? LIMIT 1")
    .bind(table)
    .first();
  return Boolean((row as any)?.name);
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

    const inventoryBaseWhere = ["status = 'published'", "lower(COALESCE(allowed_sections,'')) LIKE '%library%'"];
    const inventoryWhere = [...inventoryBaseWhere];
    const inventoryArgs: any[] = [];

    if (q) {
      inventoryWhere.push(
        "(lower(COALESCE(title,'')) LIKE ? OR lower(COALESCE(text,'')) LIKE ? OR lower(COALESCE(summary,'')) LIKE ? OR lower(COALESCE(search_text,'')) LIKE ? OR lower(COALESCE(credit_line,'')) LIKE ? OR lower(COALESCE(source_name,'')) LIKE ? OR lower(COALESCE(perspective_label,'')) LIKE ?)",
      );
      const like = `%${q}%`;
      inventoryArgs.push(like, like, like, like, like, like, like);
    }

    const inventoryBaseWhereSql = `WHERE ${inventoryBaseWhere.join(' AND ')}`;
    const inventoryWhereSql = `WHERE ${inventoryWhere.join(' AND ')}`;

    const inventoryEligibleRow = await auth.db
      .prepare(`SELECT COUNT(1) AS n FROM content_inventory ${inventoryBaseWhereSql}`)
      .first();
    const inventoryEligibleTotal = Number((inventoryEligibleRow as any)?.n ?? 0) || 0;

    if (inventoryEligibleTotal > 0) {
      const countRow = await auth.db
        .prepare(`SELECT COUNT(1) AS n FROM content_inventory ${inventoryWhereSql}`)
        .bind(...inventoryArgs)
        .first();
      const total = Number((countRow as any)?.n ?? 0) || 0;

      const rows = await auth.db
        .prepare(
          `SELECT id, title, text, summary, credit_line, source_name, event_date, event_year, updated_at
           FROM content_inventory
           ${inventoryWhereSql}
           ORDER BY priority DESC, updated_at DESC, id DESC
           LIMIT ? OFFSET ?`
        )
        .bind(...inventoryArgs, PAGE_SIZE, offset)
        .all();

      const items = (rows.results || []).map((row: any) => ({
        id: row.id,
        year: row.event_year ?? (row.event_date ? Number(String(row.event_date).slice(0, 4)) || null : null),
        author: row.credit_line || row.source_name || null,
        title: row.title || null,
        description: row.summary || (row.text ? String(row.text).slice(0, 100) : null),
        url: null,
        content: row.text || null,
      }));

      return new Response(
        JSON.stringify({ ok: true, items, page, page_size: PAGE_SIZE, total }, null, 2),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!(await tableExists(auth.db, 'library_entries'))) {
      return new Response(
        JSON.stringify({ ok: true, items: [], page, page_size: PAGE_SIZE, total: 0 }, null, 2),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
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
         LIMIT ? OFFSET ?`
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
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
