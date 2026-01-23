// Cloudflare Pages Function: GET /api/matchup/results
// Query params:
// - week_start=YYYY-MM-DD (optional; defaults to current week)
//
// Returns vote totals for that week and the prior week's winner summary.

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function toMondayISO(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1 - day); // back to Monday
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function getWeek(env: any, week_start: string) {
  const matchup = await env.DB.prepare(
    "SELECT week_start, photo_a_id, photo_b_id, status FROM weekly_matchups WHERE week_start = ?1 LIMIT 1;"
  ).bind(week_start).first();

  if (!matchup) return null;

  const counts = await env.DB.prepare(
    "SELECT choice, COUNT(*) as c FROM weekly_votes WHERE week_start = ?1 GROUP BY choice;"
  ).bind(week_start).all();

  let a = 0, b = 0;
  for (const r of (counts.results || []) as any[]) {
    const ch = String(r.choice || '').toLowerCase();
    const c = Number(r.c || 0);
    if (ch === 'a') a = c;
    if (ch === 'b') b = c;
  }

  const photoA = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?1 LIMIT 1;")
    .bind((matchup as any).photo_a_id).first();
  const photoB = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?1 LIMIT 1;")
    .bind((matchup as any).photo_b_id).first();

  const winner = a === b ? 'tie' : (a > b ? 'a' : 'b');

  return {
    week_start,
    status: (matchup as any).status,
    photos: { a: photoA, b: photoB },
    totals: { a, b, winner },
  };
}

export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const qs = url.searchParams.get('week_start')?.trim();
    const week_start = (qs && /^\d{4}-\d{2}-\d{2}$/.test(qs)) ? qs : toMondayISO(new Date());

    const current = await getWeek(env, week_start);

    // prior week
    const prior_week_start = addDaysISO(week_start, -7);
    const prior = await getWeek(env, prior_week_start);

    return json({ ok: true, week_start, current, prior }, 200);
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
};
