/**
 * POST /api/discussions/create
 * Create a new discussion post (requires authenticated member session)
 */
import { requireMember } from '../../_lib/session';

export async function onRequestPost(ctx: any): Promise<Response> {
  try {
    const m = await requireMember(ctx);
    if (!m.ok) {
      return Response.json(m.body, { status: m.status });
    }

    const body = await ctx.request.json();
    const { title, body: postBody } = body;

    if (!title || !postBody) {
      return Response.json({ ok: false, error: 'Title and body are required.' }, { status: 400 });
    }

    const result = await m.db.prepare(
      `INSERT INTO discussions (title, body, author_email, status, created_at)
       VALUES (?, ?, ?, 'posted', datetime('now'))
       RETURNING id, title, body, author_email, created_at`
    )
      .bind(title, postBody, m.email)
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
