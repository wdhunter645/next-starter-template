// POST /api/admin/faq/approve
// Approves a pending FAQ entry with an answer

import { requireAdmin } from "../../../_lib/auth";

export const onRequestPost = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  try {
    const body = await request.json();
    const id = Number(body?.id);
    const answer = String(body?.answer || '').trim();

    if (!Number.isInteger(id) || id <= 0) {
      return new Response(JSON.stringify({ ok: false, error: 'Valid FAQ entry ID required' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!answer) {
      return new Response(JSON.stringify({ ok: false, error: 'Answer is required to approve' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = env.DB as any;
    
    // Update status to approved, set answer, and update timestamp
    await db.prepare(
      "UPDATE faq_entries SET status = 'approved', answer = ?, updated_at = datetime('now') WHERE id = ? AND status = 'pending'"
    ).bind(answer, id).run();

    return new Response(JSON.stringify({ ok: true }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error("admin faq/approve error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
