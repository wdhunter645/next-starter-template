// GET /api/membership-card
// Returns the currently posted membership card content (markdown text).

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet = async (context: any): Promise<Response> => {
  const { env } = context;
  try {
    const row = await env.DB.prepare(
      `SELECT id, title, body_md, updated_at FROM membership_card_content WHERE status = 'posted' ORDER BY updated_at DESC, id DESC LIMIT 1`
    ).first();

    return json({ ok: true, content: row || null });
  } catch (e: any) {
    console.error('membership-card api error:', e);
    return json({ ok: false, error: 'Failed to load membership card content.' }, 500);
  }
};
