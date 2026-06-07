// POST /api/admin/editorial/publish
// Updates content_inventory publication state. Protected by ADMIN_TOKEN.

import { requireAdmin } from "../../../_lib/auth";
import { jsonResponse, requireD1, requireTables } from "../../../_lib/d1";

const VALID_STATUSES = new Set(["draft", "published", "archived"]);

function asInt(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function hasRequiredFields(row: Record<string, unknown>, fields: string[]): boolean {
  return fields.every((field) => String(row[field] || "").trim().length > 0);
}

export const onRequestPost = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const d1 = requireD1(env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);

  const tables = await requireTables(d1.db, ["content_inventory"]);
  if (!tables.ok) return jsonResponse(tables.body, tables.status);

  try {
    const body = await request.json().catch(() => null);
    const id = asInt(body?.id);
    const status = typeof body?.status === "string" ? body.status.trim() : "";

    if (!id || !VALID_STATUSES.has(status)) {
      return jsonResponse({ ok: false, error: "id and valid status are required." }, 400);
    }

    const existing = await d1.db
      .prepare("SELECT id, status, source_name, credit_line FROM content_inventory WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return jsonResponse({ ok: false, error: "Content record not found." }, 404);
    }

    if (
      status === "published" &&
      !hasRequiredFields(existing as Record<string, unknown>, ["source_name", "credit_line"])
    ) {
      return jsonResponse(
        { ok: false, error: "Published content_inventory records require source_name and credit_line." },
        400,
      );
    }

    const nowRow = await d1.db.prepare("SELECT datetime('now') AS now").first();
    const now = String((nowRow as any)?.now || new Date().toISOString());
    const publishedAt = status === "published" ? now : null;

    await d1.db
      .prepare(
        `UPDATE content_inventory
            SET status = ?, updated_at = ?, published_at = ?
          WHERE id = ?`,
      )
      .bind(status, now, publishedAt, id)
      .run();

    return jsonResponse({ ok: true, id, status, published_at: publishedAt }, 200);
  } catch (err: any) {
    console.error("admin editorial publish error:", err);
    return jsonResponse({ ok: false, error: "Publication update failed." }, 500);
  }
};
