export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const body = await request.json();
    const question = String(body?.question || '').trim();

    if (!question) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing question' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert as pending. Admin triage comes later.
    await env.DB.prepare(
      "INSERT INTO faq_entries (question, answer, status) VALUES (?, '', 'pending');"
    ).bind(question).run();

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
