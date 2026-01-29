export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const month = (url.searchParams.get('month') || '').trim(); // YYYY-MM

    const monthRe = /^\d{4}-\d{2}$/;
    const monthKey = monthRe.test(month) ? month : (() => {
      const d = new Date();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      return `${d.getUTCFullYear()}-${m}`;
    })();

    const start = `${monthKey}-01`;

    // Fetch posted events that start in the given month
    const sql = `SELECT id, title, start_date, end_date, location, host, fees, description, external_url
                 FROM events
                 WHERE status='posted' AND substr(start_date, 1, 7) = ?
                 ORDER BY start_date ASC, id ASC;`;

    const rows = await env.DB.prepare(sql).bind(monthKey).all();

    return new Response(JSON.stringify({ ok: true, month: monthKey, items: rows.results ?? [] }, null, 2), {
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
