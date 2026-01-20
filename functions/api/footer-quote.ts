// GET /api/footer-quote
// Returns a random posted footer quote.

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet = async (context: any): Promise<Response> => {
  const { env } = context;
  try {
    const res = await env.DB.prepare(
      `SELECT id, quote, attribution FROM footer_quotes WHERE status = 'posted' ORDER BY RANDOM() LIMIT 1`
    ).first();

    if (!res) return json({ ok: true, quote: null });
    return json({ ok: true, quote: res });
  } catch (e: any) {
    console.error('footer-quote error:', e);
    return json({ ok: false, error: 'Failed to fetch footer quote.' }, 500);
  }
};
