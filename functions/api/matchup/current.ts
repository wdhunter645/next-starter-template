export const onRequestGet = async (context: any): Promise<Response> => {
  const { env } = context;

  // Public, browser-loadable base for LGFC bucket (no secrets required client-side).
  // NOTE: We intentionally use the Backblaze "friendly" public URL format here because
  // the S3 endpoint form in D1 has been observed to contain a bucket *ID* (or omit the bucket),
  // which breaks public image loading on the homepage.
  const PUBLIC_BUCKET_NAME = "LouGehrigFanClub";
  const PUBLIC_BASE = `https://f005.backblazeb2.com/file/${PUBLIC_BUCKET_NAME}`;

  const encodePath = (p: string) =>
    p
      .split("/")
      .filter(Boolean)
      .map((seg) => encodeURIComponent(seg))
      .join("/");

  const normalizePhotoUrl = (raw: any): any => {
    if (!raw || typeof raw !== "object") return raw;

    const url = typeof raw.url === "string" ? raw.url : "";
    if (!url) return raw;

    // Already in the desired public format
    if (url.startsWith(PUBLIC_BASE + "/")) return raw;

    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);

      // Common stored patterns we have seen:
      // 1) /<objectKey>
      // 2) /<bucketName>/<objectKey>
      // 3) /<bucketId>/<objectKey>
      // 4) /<bucketName>/<folder>/<objectKey>  (or bucketId instead)
      //
      // If there are 2+ segments, assume the first is a bucket identifier and drop it.
      // If there is only 1 segment, treat it as the object key.
      const keyParts = parts.length >= 2 ? parts.slice(1) : parts;
      const key = encodePath(keyParts.join("/"));

      if (!key) return raw;

      return { ...raw, url: `${PUBLIC_BASE}/${key}` };
    } catch {
      // If it's not a valid URL, leave it untouched.
      return raw;
    }
  };

  const normalizeItems = (items: any[]) => (items ?? []).map(normalizePhotoUrl);

  try {
    // 1) Prefer an active weekly_matchups row (authoritative)
    try {
      const m = await env.DB.prepare(
        "SELECT id, week_start, photo_a_id, photo_b_id, status, created_at FROM weekly_matchups WHERE status = 'active' ORDER BY week_start DESC LIMIT 1;"
      ).first();

      if (m && m.photo_a_id && m.photo_b_id) {
        const a = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?;")
          .bind(m.photo_a_id)
          .first();
        const b = await env.DB.prepare("SELECT id, url, description, title FROM photos WHERE id = ?;")
          .bind(m.photo_b_id)
          .first();

        const items = normalizeItems([a, b].filter(Boolean));

        return new Response(
          JSON.stringify(
            {
              ok: true,
              week_start: m.week_start,
              matchup_id: m.id,
              items,
            },
            null,
            2
          ),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
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
      items = await pickTwo(
        "SELECT id, url, description, title FROM photos WHERE is_matchup_eligible = 1 ORDER BY id DESC LIMIT 2;"
      );
    } catch {
      items = await pickTwo("SELECT id, url, description, title FROM photos ORDER BY id DESC LIMIT 2;");
    }

    // Provide a stable week_start even in fallback mode so voting can work
    const wsRow = await env.DB.prepare("SELECT date('now','weekday 1','-7 days') AS week_start;").first();
    const week_start = wsRow && wsRow.week_start ? String(wsRow.week_start) : null;

    return new Response(JSON.stringify({ ok: true, week_start, matchup_id: null, items: normalizeItems(items) }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
