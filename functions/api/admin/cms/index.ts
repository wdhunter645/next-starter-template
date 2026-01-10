// GET /api/admin/cms?page=<page>
// Returns content blocks for a specific page (draft + published)
// Protected by admin gate

import { requireAdminEmail } from "../../../_lib/auth";

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdminEmail(request, env);
  if (deny) return deny;

  try {
    const db = env.DB as any;
    const url = new URL(request.url);
    const page = url.searchParams.get("page")?.trim() || "";

    if (!page) {
      return new Response(
        JSON.stringify({ ok: false, error: "page parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get all blocks for the page, ordered by section and key
    const { results } = await db
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
         WHERE page = ?
         ORDER BY section ASC, key ASC`
      )
      .bind(page)
      .all();

    const blocks = results || [];

    return new Response(
      JSON.stringify({ ok: true, blocks }, null, 2),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("admin cms list error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to list content blocks" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
