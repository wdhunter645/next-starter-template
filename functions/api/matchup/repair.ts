import { requireD1, requireTables } from "../../_lib/d1";
import { repairBrokenActiveMatchupPhoto } from "./current";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * POST /api/matchup/repair
 * Body: { broken_photo_id: number }
 *
 * Browser image-load failures call this to exclude a missing object (when confirmed)
 * and replace the broken slot in the active weekly matchup without transferring votes.
 */
export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const d1Check = requireD1(env);
    if (!d1Check.ok) {
      return jsonResponse(d1Check.body, d1Check.status);
    }

    const tablesCheck = await requireTables(d1Check.db, ["weekly_matchups", "weekly_votes", "photos"]);
    if (!tablesCheck.ok) {
      return jsonResponse(tablesCheck.body, tablesCheck.status);
    }

    const body = await request.json().catch(() => null);
    const brokenPhotoId = Number(body?.broken_photo_id);

    return await repairBrokenActiveMatchupPhoto({
      db: d1Check.db,
      request,
      brokenPhotoId,
    });
  } catch (err: any) {
    return jsonResponse({ ok: false, error: String(err?.message ?? err) }, 500);
  }
};
