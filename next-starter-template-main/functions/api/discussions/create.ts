/**
 * POST /api/discussions/create
 * Create a new discussion post
 */
export async function onRequestPost(ctx: any): Promise<Response> {
  try {
    const body = await ctx.request.json();
    const { title, body: postBody, author_email } = body;

    // Validate inputs
    if (!title || !postBody) {
      return Response.json({ ok: false, error: 'Title and body are required.' }, { status: 400 });
    }

    if (!author_email) {
      return Response.json({ ok: false, error: 'Author email is required.' }, { status: 400 });
    }

    // Insert into discussions table
    const result = await ctx.env.DB.prepare(
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
