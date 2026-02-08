export const onRequestGet: PagesFunction = async (ctx) => {
  try {
    const url = new URL(ctx.request.url);
    const limitRaw = url.searchParams.get("limit") ?? "100";
    const limit = Math.max(1, Math.min(500, Number(limitRaw) || 100));

    const token = ctx.request.headers.get("x-admin-token") || ctx.request.headers.get("authorization") || "";
    const expected = (ctx.env as any).ADMIN_TOKEN;
    if (expected && token.replace(/^Bearer\s+/i, "") !== expected) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      });
    }

    const db = (ctx.env as any).DB as D1Database;

    const sql = `
      SELECT
        id,
        media_uid,
        b2_key,
        b2_file_id,
        size,
        etag,
        ingested_at
      FROM media_assets
      ORDER BY ingested_at DESC
      LIMIT ?1
    `;

    const result = await db.prepare(sql).bind(limit).all();

    return new Response(JSON.stringify({ ok: true, items: result.results ?? [] }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? "error" }), {
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
};
