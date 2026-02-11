// POST /api/admin/events/create
// Admin-only. Creates an event row.
//
// Body: { title, date, time?, location?, description? }

import { requireAdmin } from "../../../_lib/auth";

export const onRequestPost = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  try {
    const body = await request.json().catch(() => null);
    const title = String(body?.title || "").trim();
    const date = String(body?.date || "").trim(); // YYYY-MM-DD expected
    const time = String(body?.time || "").trim();
    const location = String(body?.location || "").trim();
    const description = String(body?.description || "").trim();

    if (!title || !date) {
      return Response.json({ ok: false, error: "title_and_date_required" }, { status: 400 });
    }

    if (!env?.DB) {
      return Response.json({ ok: false, error: "missing_db_binding" }, { status: 500 });
    }

    const sql = `INSERT INTO events (title, date, time, location, description)
                 VALUES (?, ?, ?, ?, ?)`;

    await env.DB.prepare(sql).bind(title, date, time, location, description).run();
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ ok: false, error: "server_error", detail: String(err?.message || err) }, { status: 500 });
  }
};
