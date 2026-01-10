// POST /api/admin/cms/[key]/save-draft
// Body: { title?, body_md }
// Saves draft version and creates revision
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

    const body = await request.json();
    const body_md = body?.body_md;
    const title = body?.title;

    if (body_md === undefined || body_md === null) {
      return new Response(
        JSON.stringify({ ok: false, error: "body_md is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get current block to increment version
    const current = await db
      .prepare("SELECT version, title FROM content_blocks WHERE key = ?")
      .bind(key)
      .first();

    if (!current) {
      return new Response(
        JSON.stringify({ ok: false, error: "Block not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const newVersion = current.version + 1;
    const now = new Date().toISOString();
    const updatedTitle = title !== undefined ? title : current.title;
    const updatedBy = "admin"; // TODO: use actual user when auth is available

    // Update content_blocks
    await db
      .prepare(
        `UPDATE content_blocks 
         SET body_md = ?,
             title = ?,
             version = ?,
             status = 'draft',
             updated_at = ?,
             updated_by = ?
         WHERE key = ?`
      )
      .bind(body_md, updatedTitle, newVersion, now, updatedBy, key)
      .run();

    // Insert revision
    await db
      .prepare(
        `INSERT INTO content_revisions (key, version, body_md, status, updated_at, updated_by)
         VALUES (?, ?, ?, 'draft', ?, ?)`
      )
      .bind(key, newVersion, body_md, now, updatedBy)
      .run();

    return new Response(
      JSON.stringify({ ok: true, version: newVersion }, null, 2),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("admin cms save-draft error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to save draft" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
