export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim();
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit') || '10')));

    // For public pages: only approved with non-empty answer
    let sql = "SELECT id, question, answer, view_count, pinned, updated_at FROM faq_entries WHERE status='approved' AND answer IS NOT NULL AND answer != ''";
    const args: any[] = [];

    if (q) {
      sql += " AND (lower(question) LIKE ? OR lower(answer) LIKE ?)";
      args.push(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`);
    }

    // Top FAQs order: pinned DESC, view_count DESC, updated_at DESC
    sql += " ORDER BY pinned DESC, view_count DESC, updated_at DESC LIMIT ?";
    args.push(limit);

    const rows = await env.DB.prepare(sql).bind(...args).all();

    return new Response(JSON.stringify({ ok: true, items: rows.results ?? [] }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
