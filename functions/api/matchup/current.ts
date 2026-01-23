// Cloudflare Pages Function: GET /api/matchup/current
// Returns the active matchup for the current week (Monday-based, UTC).
// If none exists yet, it will create one from the most recent two photos (or matchup eligible photos).

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

async function pickTwo(env: any): Promise<any[]> {
  // Prefer eligible column when present, fallback if missing.
  try {
    const rows = await env.DB.prepare(
      "SELECT id, url, description, title FROM photos WHERE is_matchup_eligible = 1 ORDER BY id DESC LIMIT 2;"
    ).all();
    const items = (rows.results ?? []) as any[];
    if (items.length >= 2) return items.slice(0, 2);
  } catch {
    // ignore
  }

  const rows = await env.DB.prepare(
    "SELECT id, url, description, title FROM photos ORDER BY id DESC LIMIT 2;"
  ).all();
  return ((rows.results ?? []) as any[]).slice(0, 2);
}

export const onRequestGet = async (context: any): Promise<Response> => {
  const { env } = context;

  try {
    const week_start = toMondayISO(new Date());

    let matchup = await env.DB.prepare(
      "SELECT id, week_start, photo_a_id, photo_b_id, status FROM weekly_matchups WHERE week_start = ?1 LIMIT 1;"
    ).bind(week_start).first();

    if (!matchup) {
      const photos = await pickTwo(env);
      if (photos.length < 2) {
        return json({ ok: true, week_start, items: photos, matchup: null }, 200);
      }

      await env.DB.prepare(
        "INSERT INTO weekly_matchups (week_start, photo_a_id, photo_b_id, status) VALUES (?1, ?2, ?3, 'active');"
      ).bind(week_start, photos[0].id, photos[1].id).run();

      matchup = await env.DB.prepare(
        "SELECT id, week_start, photo_a_id, photo_b_id, status FROM weekly_matchups WHERE week_start = ?1 LIMIT 1;"
      ).bind(week_start).first();
    }

    const photoA = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?1 LIMIT 1;")
      .bind((matchup as any).photo_a_id).first();
    const photoB = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?1 LIMIT 1;")
      .bind((matchup as any).photo_b_id).first();

    return json({ ok: true, week_start, matchup, photos: { a: photoA, b: photoB } }, 200);
  } catch (err: any) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
};
