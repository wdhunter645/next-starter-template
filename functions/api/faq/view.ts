export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const body = await request.json();
    const id = Number(body?.id);

    // Validate id is a valid integer
    if (!Number.isInteger(id) || id <= 0) {
      return new Response(JSON.stringify({ ok: false, error: 'Valid FAQ entry ID required' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Increment view_count ONLY for approved entries
    // This prevents counting views on pending/denied entries
    const result = await env.DB.prepare(
      "UPDATE faq_entries SET view_count = view_count + 1 WHERE id = ? AND status = 'approved'"
    ).bind(id).run();

    return new Response(JSON.stringify({ ok: true }, null, 2), {
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
