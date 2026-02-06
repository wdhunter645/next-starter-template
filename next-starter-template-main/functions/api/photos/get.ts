export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, params } = context;

  try {
    const id = Number((params as any)?.id);
    if (!id || Number.isNaN(id)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid id" }, null, 2), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const row = await env.DB.prepare(
      "SELECT id, url, is_memorabilia, description, created_at FROM photos WHERE id = ? LIMIT 1;"
    )
      .bind(id)
      .first();

    if (!row) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, item: row }, null, 2), {
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
