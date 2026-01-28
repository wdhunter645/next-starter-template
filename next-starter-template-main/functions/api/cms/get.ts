// GET /api/cms/get?page=home OR /api/cms/get?key=home.hero.main
// Returns published CMS blocks from content_blocks table.
// Public (no admin token). Intended for read-only site consumption.

type Block = {
  key: string;
  page: string;
  section: string;
  title: string;
  published_body_md: string | null;
  published_at: string | null;
  version: number;
  updated_at: string;
};

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const url = new URL(request.url);
  const page = (url.searchParams.get("page") || "").trim();
  const key = (url.searchParams.get("key") || "").trim();

  if (!page && !key) {
    return new Response(JSON.stringify({ ok: false, error: "Provide page or key." }, null, 2), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (key) {
      const row = await env.DB.prepare(
        `SELECT key, page, section, title, published_body_md, published_at, version, updated_at
         FROM content_blocks
         WHERE key = ? AND status = 'published'`
      ).bind(key).first();

      return new Response(JSON.stringify({ ok: true, block: row || null }, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rows = await env.DB.prepare(
      `SELECT key, page, section, title, published_body_md, published_at, version, updated_at
       FROM content_blocks
       WHERE page = ? AND status = 'published'
       ORDER BY section, key`
    ).bind(page).all();

    return new Response(JSON.stringify({ ok: true, page, blocks: rows?.results || [] }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("cms get error:", err);
    return new Response(JSON.stringify({ ok: false, error: "Fetch failed." }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
