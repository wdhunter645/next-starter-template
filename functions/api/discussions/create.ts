/**
 * POST /api/discussions/create
 * Create a new discussion post — requires authenticated member session.
 */
import { requireMember } from '../../_lib/session';

export async function onRequestPost(ctx: any): Promise<Response> {
  const auth = await requireMember(ctx);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await ctx.request.json();
    const { title, body: postBody } = body;

    // Validate inputs
    if (!title || !postBody) {
      return Response.json({ ok: false, error: 'Title and body are required.' }, { status: 400 });
    }

    // author_email is derived from the authenticated session — never trust client input
    const author_email = auth.email;

    // Insert into discussions table
    const result = await auth.db.prepare(
      `INSERT INTO discussions (title, body, author_email, status, created_at)
       VALUES (?, ?, ?, 'posted', datetime('now'))
       RETURNING id, title, body, author_email, created_at`
    )
      .bind(title, postBody, author_email)
      .first();

    if (!result) {
      return Response.json({ ok: false, error: 'Failed to create discussion.' }, { status: 500 });
    }

    return Response.json({ ok: true, discussion: result });
  } catch (err) {
    console.error('Error creating discussion:', err);
    return Response.json(
      { ok: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
