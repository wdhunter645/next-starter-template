// POST /api/admin/cms/[key]/publish
// Body: { title?, body_md? }
// Publishes block (uses current body_md if not provided)
// Protected by admin gate

import { requireAdminEmail } from "../../../../../_lib/auth";

export const onRequestPost = async (context: any): Promise<Response> => {
  const { request, env, params } = context;

  const deny = requireAdminEmail(request, env);
  if (deny) return deny;

  try {
    const db = env.DB as any;
    const key = params?.key?.trim() || "";

    if (!key) {
      return new Response(
        JSON.stringify({ ok: false, error: "key is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const bodyMdOverride = body?.body_md;
    const titleOverride = body?.title;

    // Get current block
    const current = await db
      .prepare(
        `SELECT version, title, body_md, published_body_md 
         FROM content_blocks 
         WHERE key = ?`
      )
      .bind(key)
      .first();

    if (!current) {
      return new Response(
        JSON.stringify({ ok: false, error: "Block not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine what to publish
    const bodyToPublish = bodyMdOverride !== undefined ? bodyMdOverride : current.body_md;
    const titleToPublish = titleOverride !== undefined ? titleOverride : current.title;

    // Increment version if body changed since last publish
    const bodyChanged = bodyToPublish !== current.published_body_md;
    const newVersion = bodyChanged ? current.version + 1 : current.version;

    const now = new Date().toISOString();
    const updatedBy = "admin"; // TODO: use actual user when auth is available

    // Update content_blocks
    await db
      .prepare(
        `UPDATE content_blocks 
         SET published_body_md = ?,
             body_md = ?,
             title = ?,
             status = 'published',
             version = ?,
             published_at = ?,
             updated_at = ?,
             updated_by = ?
         WHERE key = ?`
      )
      .bind(
        bodyToPublish,
        bodyToPublish,
        titleToPublish,
        newVersion,
        now,
        now,
        updatedBy,
        key
      )
      .run();

    // Insert revision
    await db
      .prepare(
        `INSERT INTO content_revisions (key, version, body_md, status, updated_at, updated_by)
         VALUES (?, ?, ?, 'published', ?, ?)`
      )
      .bind(key, newVersion, bodyToPublish, now, updatedBy)
      .run();

    return new Response(
      JSON.stringify({ ok: true, version: newVersion }, null, 2),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("admin cms publish error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to publish" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
