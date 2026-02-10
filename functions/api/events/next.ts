export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit') || '10')));

    const now = new Date();
    const today =
      now.getUTCFullYear() +
      '-' +
      String(now.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getUTCDate()).padStart(2, '0');

    const rows = await env.DB.prepare(`
      SELECT id, title, start_date, end_date, location, host, fees, description, external_url
      FROM events
      WHERE status='posted' AND start_date >= ?
      ORDER BY start_date ASC
      LIMIT ?
    `).bind(today, limit).all();

    return new Response(JSON.stringify({
      ok: true,
      today,
      items: rows.results ?? []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
