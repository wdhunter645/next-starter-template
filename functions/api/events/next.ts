export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const raw = (url.searchParams.get('limit') || '10').trim();
    const limit = Math.max(1, Math.min(50, Number(raw) || 10));

    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;

    const rows = await env.DB.prepare(
      `
      SELECT id, title, start_date, end_date, location, host, fees, description, external_url
      FROM events
      WHERE status='posted' AND start_date >= ?
      ORDER BY start_date ASC, id ASC
      LIMIT ?;
      `
    ).bind(today, limit).all();

    return new Response(
      JSON.stringify({ ok: true, today, limit, items: rows.results ?? [] }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
