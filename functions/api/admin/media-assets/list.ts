// GET /api/admin/media-assets/list?limit=100
// Returns recent media_assets. Protected by ADMIN_TOKEN.

import { requireAdmin } from "../../../_lib/auth";

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  try {
    const url = new URL(request.url);
    const limitRaw = Number(url.searchParams.get("limit") || "100");
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 100;

    const db = env.DB as any;
    const q = `
      SELECT id, media_uid, b2_key, b2_file_id, size, etag, ingested_at
      FROM media_assets
      ORDER BY id DESC
      LIMIT ?
    `;
    const r = await db.prepare(q).bind(limit).all();

    return new Response(JSON.stringify({ ok: true, items: r?.results || [] }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("media-assets list error:", err);
    return new Response(JSON.stringify({ ok: false, error: "Failed to list media assets." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
