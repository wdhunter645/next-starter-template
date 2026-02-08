// GET /api/admin/join-requests/list
// Returns recent join_requests rows. Protected by ADMIN_TOKEN.

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
        "SELECT id, name, email, created_at FROM join_requests ORDER BY id DESC LIMIT ?;"
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
