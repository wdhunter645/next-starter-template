// POST /api/admin/cms/[key]/rollback
// Body: { version }
// Rollback published content to a prior revision
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
    const targetVersion = body?.version;

    if (!targetVersion || typeof targetVersion !== 'number') {
      return new Response(
        JSON.stringify({ ok: false, error: "version is required and must be a number" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the revision to rollback to
    const revision = await db
      .prepare(
        `SELECT body_md 
         FROM content_revisions 
         WHERE key = ? AND version = ?`
      )
      .bind(key, targetVersion)
      .first();

    if (!revision) {
      return new Response(
        JSON.stringify({ ok: false, error: "Revision not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get current block version
    const current = await db
      .prepare("SELECT version FROM content_blocks WHERE key = ?")
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
    const updatedBy = "admin"; // TODO: use actual user when auth is available

    // Update content_blocks with rolled back content
    await db
      .prepare(
        `UPDATE content_blocks 
         SET published_body_md = ?,
             body_md = ?,
             status = 'published',
             version = ?,
             published_at = ?,
             updated_at = ?,
             updated_by = ?
         WHERE key = ?`
      )
      .bind(
        revision.body_md,
        revision.body_md,
        newVersion,
        now,
        now,
        updatedBy,
        key
      )
      .run();

    // Insert revision noting the rollback
    await db
      .prepare(
        `INSERT INTO content_revisions (key, version, body_md, status, updated_at, updated_by)
         VALUES (?, ?, ?, 'published', ?, ?)`
      )
      .bind(key, newVersion, revision.body_md, now, updatedBy)
      .run();

    return new Response(
      JSON.stringify({ 
        ok: true, 
        version: newVersion,
        rolledBackTo: targetVersion 
      }, null, 2),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("admin cms rollback error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to rollback" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
