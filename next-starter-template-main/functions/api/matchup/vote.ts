function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const body = await request.json().catch(() => ({}));
    const week_start = String(body.week_start || '').trim();
    const choice = String(body.choice || '').trim().toLowerCase();

    if (!week_start) {
      return new Response(JSON.stringify({ ok: false, error: 'missing_week_start' }, null, 2), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (choice !== 'a' && choice !== 'b') {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_choice' }, null, 2), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Build a stable-ish source hash. (Not identity; just anti-spam.)
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
    const ua = request.headers.get('user-agent') || '';
    const raw = `${week_start}|${ip}|${ua}`;
    const source_hash = await sha256Hex(raw);

    // Insert (unique on week_start+source_hash)
    let already_voted = false;
    try {
      await env.DB.prepare(
        "INSERT INTO weekly_votes (week_start, choice, source_hash) VALUES (?, ?, ?);"
      ).bind(week_start, choice, source_hash).run();
    } catch {
      already_voted = true;
    }

    // Totals (always computed; UI decides reveal)
    const totalsRow = await env.DB.prepare(
      "SELECT SUM(CASE WHEN choice='a' THEN 1 ELSE 0 END) AS a, SUM(CASE WHEN choice='b' THEN 1 ELSE 0 END) AS b FROM weekly_votes WHERE week_start = ?;"
    ).bind(week_start).first();

    const a = Number((totalsRow && totalsRow.a) || 0);
    const b = Number((totalsRow && totalsRow.b) || 0);

    return new Response(JSON.stringify({ ok: true, week_start, choice, already_voted, totals: { a, b } }, null, 2), {
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
