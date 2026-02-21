export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    // 1) Prefer an active weekly_matchups row (authoritative)
    try {
      const m = await env.DB.prepare(
        "SELECT id, week_start, photo_a_id, photo_b_id, status, created_at FROM weekly_matchups WHERE status = 'active' ORDER BY week_start DESC LIMIT 1;"
      ).first();

      if (m && m.photo_a_id && m.photo_b_id) {
        const a = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?;").bind(m.photo_a_id).first();
        const b = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?;").bind(m.photo_b_id).first();

        const items = [a, b].filter(Boolean);

        return new Response(JSON.stringify({
          ok: true,
          week_start: m.week_start,
          matchup_id: m.id,
          items
        }, null, 2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // fall through to photo-pick fallback
    }

    // 2) Fallback: pick two photos (legacy)
    const pickTwo = async (sql: string) => {
      const rows = await env.DB.prepare(sql).all();
      const items = (rows.results ?? []) as any[];
      return items.slice(0, 2);
    };

    let items: any[] = [];
    try {
      items = await pickTwo("SELECT id, url, description, title FROM photos WHERE is_matchup_eligible = 1 ORDER BY id DESC LIMIT 2;");
    } catch {
      items = await pickTwo("SELECT id, url, description, title FROM photos ORDER BY id DESC LIMIT 2;");
    }

        // Provide a stable week_start even in fallback mode so voting can work
    const wsRow = await env.DB.prepare("SELECT date('now','weekday 1','-7 days') AS week_start;").first();
    const week_start = wsRow && wsRow.week_start ? String(wsRow.week_start) : null;

    return new Response(JSON.stringify({ ok: true, week_start, matchup_id: null, items }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
