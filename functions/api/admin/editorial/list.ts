// GET /api/admin/editorial/list
// Returns editorial submission queue and content_inventory records. Protected by ADMIN_TOKEN.

import { requireAdmin } from "../../../_lib/auth";
import { jsonResponse, requireD1, requireTables } from "../../../_lib/d1";

const VALID_SUBMISSION_STATUSES = new Set(["pending", "approved", "rejected_auto", "rejected_manual", "all"]);
const VALID_INVENTORY_STATUSES = new Set(["draft", "published", "archived", "all"]);

function parseLimit(raw: string | null): number {
  const n = Number(raw || "50");
  return Number.isFinite(n) ? Math.min(Math.max(Math.floor(n), 1), 200) : 50;
}

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const d1 = requireD1(env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);

  const tables = await requireTables(d1.db, ["submission_queue", "content_inventory"]);
  if (!tables.ok) return jsonResponse(tables.body, tables.status);

  try {
    const url = new URL(request.url);
    const submissionStatus = url.searchParams.get("submission_status") || "pending";
    const inventoryStatus = url.searchParams.get("inventory_status") || "all";
    const limit = parseLimit(url.searchParams.get("limit"));

    if (!VALID_SUBMISSION_STATUSES.has(submissionStatus)) {
      return jsonResponse({ ok: false, error: "Invalid submission_status" }, 400);
    }

    if (!VALID_INVENTORY_STATUSES.has(inventoryStatus)) {
      return jsonResponse({ ok: false, error: "Invalid inventory_status" }, 400);
    }

    const submissionWhere = submissionStatus === "all" ? "" : "WHERE status = ?";
    const submissionRows =
      submissionStatus === "all"
        ? await d1.db
            .prepare(
              `SELECT submission_id, submitted_by, title, description, source_url, proposed_tag, media_url,
                      status, review_notes, purge_flag, created_at, updated_at, reviewed_at, reviewer
                 FROM submission_queue
                 ORDER BY created_at DESC, submission_id DESC
                 LIMIT ?`,
            )
            .bind(limit)
            .all()
        : await d1.db
            .prepare(
              `SELECT submission_id, submitted_by, title, description, source_url, proposed_tag, media_url,
                      status, review_notes, purge_flag, created_at, updated_at, reviewed_at, reviewer
                 FROM submission_queue
                 ${submissionWhere}
                 ORDER BY created_at DESC, submission_id DESC
                 LIMIT ?`,
            )
            .bind(submissionStatus, limit)
            .all();

    const inventoryRows =
      inventoryStatus === "all"
        ? await d1.db
            .prepare(
              `SELECT id, tag, title, text, summary, media, story_type, allowed_sections, priority, canonical,
                      perspective_label, source_name, source_url, credit_line, event_date, event_year, rotation_group, last_featured,
                      feature_weight, status, review_notes, submitted_by, updated_at, published_at
                 FROM content_inventory
                 ORDER BY updated_at DESC, id DESC
                 LIMIT ?`,
            )
            .bind(limit)
            .all()
        : await d1.db
            .prepare(
              `SELECT id, tag, title, text, summary, media, story_type, allowed_sections, priority, canonical,
                      perspective_label, source_name, source_url, credit_line, event_date, event_year, rotation_group, last_featured,
                      feature_weight, status, review_notes, submitted_by, updated_at, published_at
                 FROM content_inventory
                 WHERE status = ?
                 ORDER BY updated_at DESC, id DESC
                 LIMIT ?`,
            )
            .bind(inventoryStatus, limit)
            .all();

    return jsonResponse(
      {
        ok: true,
        submissions: submissionRows?.results || [],
        inventory: inventoryRows?.results || [],
      },
      200,
    );
  } catch (err: any) {
    console.error("admin editorial list error:", err);
    return jsonResponse({ ok: false, error: "Editorial list failed." }, 500);
  }
};
