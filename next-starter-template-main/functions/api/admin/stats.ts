// GET /api/admin/stats
// Returns row counts for core tables. Protected by ADMIN_TOKEN.

import { requireAdmin } from "../../_lib/auth";

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  try {
    const db = env.DB as any;
    const tables = [
      "join_requests",
      "members",
      "join_email_log",
      "login_attempts",
      "library_entries",
      "photos",
      "media_assets",
      "page_content",
      "content_blocks",
      "content_revisions",
      "faq_entries",
      "events",
      "milestones",
      "friends",
      "discussions",
      "weekly_matchups",
      "weekly_votes",
      "footer_quotes",
      "membership_card_content",
      "welcome_email_content",
      "admin_team_worklist"
    ];
    const counts: Record<string, number> = {};

    for (const t of tables) {
      const r = await db.prepare(`SELECT COUNT(*) as n FROM ${t}`).all();
      counts[t] = Number((r?.results?.[0] as any)?.n || 0);
    }

    return new Response(JSON.stringify({ ok: true, counts }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("admin stats error:", err);
    return new Response(JSON.stringify({ ok: false, error: "Stats failed." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
