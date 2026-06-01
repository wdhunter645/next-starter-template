import { requireD1, jsonResponse } from "../../_lib/d1";
import { normalizePhotoUrl } from "../../_lib/photo-url";

export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;
  const d1 = requireD1(env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);

  try {
    const url = new URL(request.url);
    const kind = (url.searchParams.get('kind') || '').trim();
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || '40')));

    let sql = "SELECT id, name, kind, blurb, url, photo_url FROM friends WHERE status='posted'";
    const args: any[] = [];
    if (kind) {
      sql += " AND kind = ?";
      args.push(kind);
    }
    sql += " ORDER BY name ASC LIMIT ?";
    args.push(limit);

    const rows = await d1.db.prepare(sql).bind(...args).all();
    const items = ((rows.results ?? []) as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      photo_url: normalizePhotoUrl({
        rawUrl: row.photo_url,
        request,
        publicB2BaseUrl: env.PUBLIC_B2_BASE_URL,
      }) || null,
    }));

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
