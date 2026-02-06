export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const body = await request.json();
    const question = String(body?.question || '').trim();
    const email = String(body?.email || '').trim();

    if (!question || question.length < 10) {
      return new Response(JSON.stringify({ ok: false, error: 'Question must be at least 10 characters' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!email || email.length > 254) {
      return new Response(JSON.stringify({ ok: false, error: 'Valid email address is required' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic email validation: at least one char before @, domain name, and TLD
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Valid email address is required' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert as pending. Admin triage comes later.
    await env.DB.prepare(
      "INSERT INTO faq_entries (question, answer, status, submitter_email) VALUES (?, '', 'pending', ?);"
    ).bind(question, email).run();

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
