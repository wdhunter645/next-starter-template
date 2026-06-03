// POST /api/admin/matchup/update
// Admin-only. Updates matchup photos or status.
//
// Body: { id, photo_a_id?, photo_b_id?, status? }

import { requireAdmin } from "../../../_lib/auth";
import { requireD1, requireTables, jsonResponse } from "../../../_lib/d1";

const STATUS_VALUES = new Set(["active", "closed"]);

export const onRequestPost = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const d1 = requireD1(env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);

  const tables = await requireTables(d1.db, ["weekly_matchups"]);
  if (!tables.ok) return jsonResponse(tables.body, tables.status);

  try {
    const body = await request.json().catch(() => null);
    const id = Number(body?.id);
    const photo_a_id = body?.photo_a_id === undefined ? null : Number(body.photo_a_id);
    const photo_b_id = body?.photo_b_id === undefined ? null : Number(body.photo_b_id);
    const statusRaw = body?.status === undefined ? null : String(body.status).trim().toLowerCase();

    if (!Number.isFinite(id) || id <= 0) {
      return jsonResponse({ ok: false, error: "invalid_id" }, 400);
    }

    const existing = await d1.db
      .prepare("SELECT id, photo_a_id, photo_b_id, status FROM weekly_matchups WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return jsonResponse({ ok: false, error: "matchup_not_found" }, 404);
    }

    const nextPhotoA = photo_a_id === null ? Number((existing as any).photo_a_id) : photo_a_id;
    const nextPhotoB = photo_b_id === null ? Number((existing as any).photo_b_id) : photo_b_id;
    const nextStatus =
      statusRaw === null
        ? String((existing as any).status || "closed")
        : STATUS_VALUES.has(statusRaw)
          ? statusRaw
          : null;

    if (nextStatus === null) {
      return jsonResponse({ ok: false, error: "invalid_status" }, 400);
    }
    if (!Number.isFinite(nextPhotoA) || nextPhotoA <= 0 || !Number.isFinite(nextPhotoB) || nextPhotoB <= 0) {
      return jsonResponse({ ok: false, error: "invalid_photo_ids" }, 400);
    }
    if (nextPhotoA === nextPhotoB) {
      return jsonResponse({ ok: false, error: "photo_ids_must_differ" }, 400);
    }

    if (nextStatus === "active") {
      const batchResults = await d1.db.batch([
        d1.db
          .prepare("UPDATE weekly_matchups SET status='closed' WHERE status='active' AND id != ?")
          .bind(id),
        d1.db
          .prepare(
            `UPDATE weekly_matchups
             SET photo_a_id=?, photo_b_id=?, status=?
             WHERE id=?`,
          )
          .bind(nextPhotoA, nextPhotoB, nextStatus, id),
      ]);

      const changed = batchResults?.[1]?.meta?.changes || 0;
      return jsonResponse({ ok: true, changed }, 200);
    }

    const out = await d1.db
      .prepare(
        `UPDATE weekly_matchups
         SET photo_a_id=?, photo_b_id=?, status=?
         WHERE id=?`,
      )
      .bind(nextPhotoA, nextPhotoB, nextStatus, id)
      .run();

    return jsonResponse({ ok: true, changed: out?.meta?.changes || 0 }, 200);
  } catch (err: any) {
    console.error("admin matchup update error:", err);
    return jsonResponse({ ok: false, error: "server_error", detail: String(err?.message || err) }, 500);
  }
};
