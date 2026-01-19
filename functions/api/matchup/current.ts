export const onRequestGet = async (context: any): Promise<Response> => {
  const { env } = context;

  try {
    // Prefer matchup eligible photos if column exists; otherwise fallback to first 2 photos.
    // SQLite will error if column missing; we catch and fallback.
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

    return new Response(JSON.stringify({ ok: true, items }, null, 2), {
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
