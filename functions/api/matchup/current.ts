type PhotoItem = {
  id: number;
  url: string;
  description?: string;
  title?: string;
};

function isUsablePhoto(item: any): item is PhotoItem {
  return !!item && typeof item.id === "number" && typeof item.url === "string" && item.url.trim().length > 0;
}

async function readPhotoById(request: Request, id: number): Promise<PhotoItem | null> {
  const endpoint = new URL(`/api/photos/get/${id}`, request.url);
  const resp = await fetch(endpoint.toString(), { method: "GET" });
  if (!resp.ok) return null;
  const json = await resp.json().catch(() => null);
  const item = json?.item;
  return isUsablePhoto(item) ? item : null;
}

async function readPhotoList(request: Request, limit: number): Promise<PhotoItem[]> {
  const endpoint = new URL(`/api/photos/list?limit=${limit}&offset=0`, request.url);
  const resp = await fetch(endpoint.toString(), { method: "GET" });
  if (!resp.ok) return [];
  const json = await resp.json().catch(() => null);
  const rawItems = Array.isArray(json?.items) ? json.items : [];
  return rawItems.filter(isUsablePhoto);
}

export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    // 1) Prefer an active weekly_matchups row (authoritative)
    try {
      const m = await env.DB.prepare(
        "SELECT id, week_start, photo_a_id, photo_b_id, status, created_at FROM weekly_matchups WHERE status = 'active' ORDER BY week_start DESC LIMIT 1;"
      ).first();

      if (m && m.photo_a_id && m.photo_b_id) {
        const a = await readPhotoById(request, Number(m.photo_a_id));
        const b = await readPhotoById(request, Number(m.photo_b_id));
        const items = [a, b].filter(isUsablePhoto).slice(0, 2);

        if (items.length >= 2) {
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

        // If active matchup entries are unusable, top up from MEDIA-02 list read path.
        const fillers = await readPhotoList(request, 20);
        const dedup = new Set(items.map((it) => it.id));
        for (const f of fillers) {
          if (!dedup.has(f.id)) {
            items.push(f);
            dedup.add(f.id);
          }
          if (items.length >= 2) break;
        }

        if (items.length >= 2) {
          return new Response(
            JSON.stringify(
              {
                ok: true,
                week_start: m.week_start,
                matchup_id: m.id,
                items: items.slice(0, 2),
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
      }
    } catch {
      // fall through to MEDIA-02 list fallback
    }

    // 2) Fallback: read directly from the MEDIA-02 photo read path
    const items = (await readPhotoList(request, 2)).slice(0, 2);

    // Provide a stable week_start even in fallback mode so voting can work
    const wsRow = await env.DB.prepare("SELECT date('now','weekday 1','-7 days') AS week_start;").first();
    const week_start = wsRow && wsRow.week_start ? String(wsRow.week_start) : null;

    return new Response(JSON.stringify({ ok: true, week_start, matchup_id: null, items }, null, 2), {
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
