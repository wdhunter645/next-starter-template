export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  // Setup cache handling
  const url = new URL(request.url);
  const slug = (url.searchParams.get("slug") || "/").trim();
  const cache = (globalThis.caches as any)?.default;
  const cacheKey = new Request(url.toString(), { method: "GET" });

  try {
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

    // Build response with cache-friendly headers
    const response = new Response(JSON.stringify({ ok: true, slug, sections: map }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600",
      },
    });

    // Write to edge cache as "last known good" (fire-and-forget)
    context.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  } catch (err: any) {
    // D1 failed - try edge cache fallback
    const cached = await cache.match(cacheKey);
    if (cached) {
      // Return cached "last known good" response with source header
      const cachedClone = cached.clone();
      const headers = new Headers(cachedClone.headers);
      headers.set("X-Content-Source", "edge-cache");
      return new Response(cachedClone.body, {
        status: cachedClone.status,
        statusText: cachedClone.statusText,
        headers,
      });
    }

    // Both D1 and cache failed - return 503
    return new Response(
      JSON.stringify({ ok: false, slug, error: "Content temporarily unavailable" }, null, 2),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
