// GET /api/admin/matchup/list?limit=50
// Returns weekly matchups with vote totals for admin review.

import { requireAdmin } from "../../../_lib/auth";
import { requireD1, requireTables, jsonResponse } from "../../../_lib/d1";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const d1 = requireD1(env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);

  const tables = await requireTables(d1.db, ["weekly_matchups", "weekly_votes"]);
  if (!tables.ok) return jsonResponse(tables.body, tables.status);

  try {
    const url = new URL(request.url);
    const limitRaw = Number(url.searchParams.get("limit") || "50");
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

    const rows = await d1.db
      .prepare(
        `SELECT id, week_start, photo_a_id, photo_b_id, status, created_at
         FROM weekly_matchups
         ORDER BY week_start DESC, id DESC
         LIMIT ?`,
      )
      .bind(limit)
      .all();

    const matchups = rows?.results || [];
    const items = [];

    for (const row of matchups) {
      const week_start = String((row as any).week_start || "");
      const totalsRow = await d1.db
        .prepare(
          `SELECT SUM(CASE WHEN choice='a' THEN 1 ELSE 0 END) AS a,
                  SUM(CASE WHEN choice='b' THEN 1 ELSE 0 END) AS b
           FROM weekly_votes
           WHERE week_start = ?`,
        )
        .bind(week_start)
        .first();

      const a = Number((totalsRow as any)?.a || 0);
      const b = Number((totalsRow as any)?.b || 0);
      const winner = a === b ? "tie" : a > b ? "a" : "b";

      items.push({
        id: Number((row as any).id),
        week_start,
        photo_a_id: Number((row as any).photo_a_id),
        photo_b_id: Number((row as any).photo_b_id),
        status: String((row as any).status || ""),
        created_at: String((row as any).created_at || ""),
        votes: { a, b, total: a + b, winner },
      });
    }

    const active = items.find((item) => item.status === "active") || null;

    return jsonResponse({ ok: true, active, items }, 200);
  } catch (err: any) {
    console.error("admin matchup list error:", err);
    return jsonResponse({ ok: false, error: "Failed to list matchups." }, 500);
  }
};

export function isValidWeekStart(value: string): boolean {
  return DATE_RE.test(value);
}
