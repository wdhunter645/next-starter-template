// POST /api/admin/matchup/repair
// Admin-only mid-week broken-slot replace (#3028).
// Body: { broken_photo_id: number, source_issue: number|string }
//
// Requires ADMIN_TOKEN + source_issue (GitHub Issue). Pair change clears votes (0–0).
// Vote restore is not possible with current schema.

import { requireAdmin } from "../../../_lib/auth";
import { requireD1, requireTables, jsonResponse } from "../../../_lib/d1";
import { normalizeSourceIssue } from "../../../_lib/matchup-repair-audit";
import { repairBrokenActiveMatchupPhoto } from "../../matchup/current";

export const onRequestPost = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const d1 = requireD1(env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);

  const tables = await requireTables(d1.db, ["weekly_matchups", "weekly_votes", "photos"]);
  if (!tables.ok) return jsonResponse(tables.body, tables.status);

  try {
    const body = await request.json().catch(() => null);
    const brokenPhotoId = Number(body?.broken_photo_id);
    const sourceIssue = normalizeSourceIssue(body?.source_issue);

    if (!sourceIssue) {
      return jsonResponse(
        {
          ok: false,
          error: "source_issue_required",
          detail:
            "Mid-week photo replace/restore requires a GitHub source_issue. Votes cannot be restored; pair change resets voting to 0-0.",
        },
        400,
      );
    }

    return await repairBrokenActiveMatchupPhoto({
      db: d1.db,
      request,
      brokenPhotoId,
      allowMutation: true,
      sourceIssue,
      trigger: "admin_authorized",
    });
  } catch (err: any) {
    console.error("admin matchup repair error:", err);
    return jsonResponse({ ok: false, error: "server_error", detail: String(err?.message || err) }, 500);
  }
};
