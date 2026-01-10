// POST /api/admin/cms/[key]/unpublish
// Unpublishes block, sets status to draft, clears published_body_md
// Protected by admin gate

import { requireAdminEmail } from "../../../../_lib/auth";
import { DEFAULT_ADMIN_USER } from "../_constants";

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

    // Get current block
    const current = await db
      .prepare(
        `SELECT version, body_md, status 
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

    const now = new Date().toISOString();
    const updatedBy = DEFAULT_ADMIN_USER; // TODO: use actual user when auth is available

    // Update content_blocks - set to draft, clear published_body_md
    await db
      .prepare(
        `UPDATE content_blocks 
         SET status = 'draft',
             published_body_md = NULL,
             updated_at = ?,
             updated_by = ?
         WHERE key = ?`
      )
      .bind(now, updatedBy, key)
      .run();

    // Insert revision noting the unpublish action
    await db
      .prepare(
        `INSERT INTO content_revisions (key, version, body_md, status, updated_at, updated_by)
         VALUES (?, ?, ?, 'draft', ?, ?)`
      )
      .bind(key, current.version, current.body_md, now, updatedBy)
      .run();

    return new Response(
      JSON.stringify({ ok: true }, null, 2),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("admin cms unpublish error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to unpublish" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
