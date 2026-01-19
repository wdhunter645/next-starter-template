export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const kind = (url.searchParams.get('kind') || '').trim();
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || '40')));

    let sql = "SELECT id, name, kind, blurb, url, photo_url FROM friends WHERE status='posted'";
    const args: any[] = [];
    if (kind) {
      sql += " AND kind = ?";
      args.push(kind);
    }
    sql += " ORDER BY name ASC LIMIT ?";
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
