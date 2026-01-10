// GET /api/admin/cms/[key]
// Returns full block + last 20 revisions
// Protected by admin gate

import { requireAdminEmail } from "../../../../_lib/auth";

export const onRequestGet = async (context: any): Promise<Response> => {
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

    // Get the current block
    const block = await db
      .prepare(
        `SELECT 
          key,
          page,
          section,
          title,
          status,
          body_md,
          published_body_md,
          version,
          updated_at,
          published_at,
          updated_by
         FROM content_blocks
         WHERE key = ?`
      )
      .bind(key)
      .first();

    if (!block) {
      return new Response(
        JSON.stringify({ ok: false, error: "Block not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get last 20 revisions
    const { results: revisions } = await db
      .prepare(
        `SELECT 
          id,
          key,
          version,
          body_md,
          status,
          updated_at,
          updated_by
         FROM content_revisions
         WHERE key = ?
         ORDER BY version DESC
         LIMIT 20`
      )
      .bind(key)
      .all();

    return new Response(
      JSON.stringify({ ok: true, block, revisions: revisions || [] }, null, 2),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("admin cms get block error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to get content block" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
