export const onRequestGet = async (context: any): Promise<Response> => {
  const { env } = context;

  // Bucket name is not secret. Prefer env.B2_BUCKET if present, otherwise hard fallback.
  const BUCKET: string =
    env && (env.B2_BUCKET || env.NEXT_PUBLIC_B2_BUCKET)
      ? String(env.B2_BUCKET || env.NEXT_PUBLIC_B2_BUCKET)
      : "LouGehrigFanClub";

  // Normalize legacy/bad photo URLs stored in D1.
  // Observed in prod: photos.url like
  //   https://s3.<region>.backblazeb2.com/<objectKey>
  // which is missing the bucket segment and 403s in browsers.
  //
  // Expected (path-style):
  //   https://s3.<region>.backblazeb2.com/<bucket>/<objectKey>
  //
  // NOTE: This does NOT require secrets and does not change DB contents;
  // it only returns corrected URLs to the client.
  const normalizePhotoUrl = (raw: any): any => {
    if (!raw || typeof raw !== "object") return raw;
    const url = raw.url;
    if (typeof url !== "string" || url.length === 0) return raw;

    // Only fix the specific broken pattern we have evidence for.
    const m = url.match(/^https:\/\/s3\.([^./]+)\.backblazeb2\.com\/(.+)$/);
    if (m) {
      const region = m[1];
      const rest = m[2];

      // If it already starts with the bucket, leave it.
      if (rest.startsWith(`${BUCKET}/`) || rest.startsWith(`${BUCKET}%2F`)) {
        return raw;
      }

      const fixed = `https://s3.${region}.backblazeb2.com/${BUCKET}/${rest.replace(/^\/+/, "")}`;
      return { ...raw, url: fixed };
    }

    return raw;
  };

  try {
    // 1) Prefer an active weekly_matchups row (authoritative)
    try {
      const m = await env.DB.prepare(
        "SELECT id, week_start, photo_a_id, photo_b_id, status, created_at FROM weekly_matchups WHERE status = 'active' ORDER BY week_start DESC LIMIT 1;"
      ).first();

      if (m && m.photo_a_id && m.photo_b_id) {
        const a = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?;").bind(m.photo_a_id).first();
        const b = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?;").bind(m.photo_b_id).first();

        const items = [a, b].filter(Boolean).map(normalizePhotoUrl);

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

    items = items.map(normalizePhotoUrl);

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
