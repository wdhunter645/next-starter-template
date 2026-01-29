export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const week_start = (url.searchParams.get('week_start') || '').trim();

    // If week_start not provided, use active matchup's week_start if available
    let ws = week_start;
    if (!ws) {
      const m = await env.DB.prepare(
        "SELECT week_start FROM weekly_matchups WHERE status='active' ORDER BY week_start DESC LIMIT 1;"
      ).first();
      if (m && m.week_start) ws = String(m.week_start);
    }

    if (!ws) {
      return new Response(JSON.stringify({ ok: true, week_start: null, totals: { a: 0, b: 0 }, last_week: null }, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const totalsRow = await env.DB.prepare(
      "SELECT SUM(CASE WHEN choice='a' THEN 1 ELSE 0 END) AS a, SUM(CASE WHEN choice='b' THEN 1 ELSE 0 END) AS b FROM weekly_votes WHERE week_start = ?;"
    ).bind(ws).first();

    const a = Number((totalsRow && totalsRow.a) || 0);
    const b = Number((totalsRow && totalsRow.b) || 0);

    // Last closed matchup (optional)
    const last = await env.DB.prepare(
      "SELECT week_start FROM weekly_matchups WHERE status='closed' ORDER BY week_start DESC LIMIT 1;"
    ).first();

    let last_week: any = null;
    if (last && last.week_start) {
      const lws = String(last.week_start);
      const lr = await env.DB.prepare(
        "SELECT SUM(CASE WHEN choice='a' THEN 1 ELSE 0 END) AS a, SUM(CASE WHEN choice='b' THEN 1 ELSE 0 END) AS b FROM weekly_votes WHERE week_start = ?;"
      ).bind(lws).first();
      const la = Number((lr && lr.a) || 0);
      const lb = Number((lr && lr.b) || 0);
      const winner = la === lb ? 'tie' : (la > lb ? 'a' : 'b');
      last_week = { week_start: lws, totals: { a: la, b: lb }, winner };
    }

    return new Response(JSON.stringify({ ok: true, week_start: ws, totals: { a, b }, last_week }, null, 2), {
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
