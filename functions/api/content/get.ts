export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const slug = (url.searchParams.get("slug") || "/").trim();

    // Expect DB binding name: env.DB (Cloudflare D1)
    const rows = await env.DB
      .prepare(
        "SELECT section, content, asset_url, updated_at FROM page_content WHERE slug = ? AND status = 'live'"
      )
      .bind(slug)
      .all();

    const items = rows?.results ?? [];
    const map: Record<string, any> = {};
    for (const r of items) {
      map[String(r.section)] = {
        content: r.content ?? null,
        asset_url: r.asset_url ?? null,
        updated_at: r.updated_at ?? null,
      };
    }

    return new Response(JSON.stringify({ ok: true, slug, sections: map }, null, 2), {
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
