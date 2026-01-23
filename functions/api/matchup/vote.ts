// Cloudflare Pages Function: POST /api/matchup/vote
// Records a vote for the active weekly matchup.
//
// Body: { week_start: string, choice: 'a'|'b' }
//
// Vote uniqueness is enforced by weekly_votes(week_start, source_hash).

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const body = await request.json().catch(() => null) as any;
    const week_start = String(body?.week_start || '').trim();
    const choice = String(body?.choice || '').trim().toLowerCase();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(week_start)) return json({ ok: false, error: 'Invalid week_start.' }, 400);
    if (!(choice === 'a' || choice === 'b')) return json({ ok: false, error: 'Invalid choice.' }, 400);

    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const ua = request.headers.get('User-Agent') || '';
    const source_hash = await sha256Hex(`${ip}|${ua}`.slice(0, 500));

    // Ensure matchup exists and is active for this week
    const matchup = await env.DB.prepare(
      "SELECT id, status FROM weekly_matchups WHERE week_start = ?1 LIMIT 1;"
    ).bind(week_start).first();

    if (!matchup) return json({ ok: false, error: 'No active matchup for this week.' }, 409);
    if (String((matchup as any).status || '').toLowerCase() !== 'active') {
      return json({ ok: false, error: 'Matchup is closed.' }, 409);
    }

    // Insert vote (unique per source_hash)
    try {
      await env.DB.prepare(
        "INSERT INTO weekly_votes (week_start, choice, source_hash) VALUES (?1, ?2, ?3);"
      ).bind(week_start, choice, source_hash).run();
    } catch (e: unknown) {
      // Unique constraint hit => already voted
      return json({ ok: true, already_voted: true }, 200);
    }

    return json({ ok: true, already_voted: false }, 200);
  } catch (e: unknown) {
    return json({ ok: false, error: String(e instanceof Error ? e.message : e) }, 500);
  }
};
