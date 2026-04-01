import { requireMember } from '../../_lib/session';
import { normalizePhotoUrl } from '../../_lib/photo-url';

const PAGE_SIZE = 24;

function parsePage(raw: string | null): number {
  const n = Number(raw || '1');
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function parseTags(raw: string | null): string[] {
  return String(raw || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
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
    const url = new URL(context.request.url);
    const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
    const tags = parseTags(url.searchParams.get('tags'));
    const page = parsePage(url.searchParams.get('page'));
    const offset = (page - 1) * PAGE_SIZE;

    // Canonical rule: memorabilia is a tagged/filtered view of photos.
    const where: string[] = ['is_memorabilia = 1'];
    const args: any[] = [];

    if (q) {
      where.push('(lower(COALESCE(title,\'\')) LIKE ? OR lower(COALESCE(description,\'\')) LIKE ? OR lower(COALESCE(tags,\'\')) LIKE ?)');
      const like = `%${q}%`;
      args.push(like, like, like);
    }

    for (const t of tags) {
      where.push('lower(COALESCE(tags,\'\')) LIKE ?');
      args.push(`%${t}%`);
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;

    const countRow = await auth.db
      .prepare(`SELECT COUNT(1) AS n FROM photos ${whereSql}`)
      .bind(...args)
      .first();
    const total = Number((countRow as any)?.n ?? 0) || 0;

    const rows = await auth.db
      .prepare(
        `SELECT id, photo_id, url, title, description, tags
         FROM photos
         ${whereSql}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...args, PAGE_SIZE, offset)
      .all();

    const items = (rows.results || []).map((row: any) => ({
      id: row.id,
      b2_key: row.photo_id || row.url || null,
      thumbnail_url: normalizePhotoUrl({ rawUrl: row?.url, request: context.request, publicB2BaseUrl: context.env.PUBLIC_B2_BASE_URL }),
      title: row.title || null,
      description: row.description || null,
      tags: row.tags || null,
    }));

    // Schema-safe linkage: library_entries has no explicit photo foreign key yet.
    const relatedLibraryRows = await auth.db
      .prepare(
        q
          ? `SELECT id, title, content
             FROM library_entries
             WHERE lower(COALESCE(title,'')) LIKE ? OR lower(COALESCE(content,'')) LIKE ?
             ORDER BY created_at DESC, id DESC
             LIMIT 5`
          : `SELECT id, title, content
             FROM library_entries
             ORDER BY created_at DESC, id DESC
             LIMIT 5`
      )
      .bind(...(q ? [`%${q}%`, `%${q}%`] : []))
      .all();

    const related_library_entries = (relatedLibraryRows.results || []).map((row: any) => ({
      id: row.id,
      title: row.title || null,
      excerpt: row.content ? String(row.content).slice(0, 160) : null,
    }));

    return new Response(
      JSON.stringify({ ok: true, items, related_library_entries, page, page_size: PAGE_SIZE, total }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
