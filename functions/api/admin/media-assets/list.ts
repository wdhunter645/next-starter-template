// GET /api/admin/media-assets/list
// Returns recent media_assets rows. Protected by ADMIN_TOKEN.

import { requireAdmin } from "../../../_lib/auth";

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  try {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit") || "50")));
    const db = env.DB as any;

    const rs = await db
      .prepare(
        "SELECT id, media_uid, b2_key, b2_file_id, size, etag, ingested_at FROM media_assets ORDER BY id DESC LIMIT ?;"
      )
      .bind(limit)
      .all();

    return new Response(JSON.stringify({ ok: true, items: rs.results ?? [] }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
