// POST /api/admin/events/update
// Admin-only. Updates an event row.
//
// Body: { id, title, date, time?, location?, description? }

import { requireAdmin } from "../../_lib/auth";

export const onRequestPost = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  try {
    const body = await request.json().catch(() => null);

    const id = Number(body?.id);
    const title = String(body?.title || "").trim();
    const date = String(body?.date || "").trim();
    const time = String(body?.time || "").trim();
    const location = String(body?.location || "").trim();
    const description = String(body?.description || "").trim();

    if (!Number.isFinite(id) || id <= 0) {
      return Response.json({ ok: false, error: "invalid_id" }, { status: 400 });
    }
    if (!title || !date) {
      return Response.json({ ok: false, error: "title_and_date_required" }, { status: 400 });
    }

    if (!env?.DB) {
      return Response.json({ ok: false, error: "missing_db_binding" }, { status: 500 });
    }

    const sql = `UPDATE events
                 SET title=?, date=?, time=?, location=?, description=?
                 WHERE id=?`;

    const out = await env.DB.prepare(sql).bind(title, date, time, location, description, id).run();
    return Response.json({ ok: true, changed: out?.meta?.changes || 0 });
  } catch (err: any) {
    return Response.json({ ok: false, error: "server_error", detail: String(err?.message || err) }, { status: 500 });
  }
};
