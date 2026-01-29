export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || '50')));

    const sql = `SELECT m.id, m.year, m.title, m.description, m.photo_id, p.url as photo_url
                 FROM milestones m
                 LEFT JOIN photos p ON p.id = m.photo_id
                 WHERE m.status='posted'
                 ORDER BY (CASE WHEN m.year IS NULL THEN 99999 ELSE m.year END) ASC, m.id ASC
                 LIMIT ?;`;

    const rows = await env.DB.prepare(sql).bind(limit).all();

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
