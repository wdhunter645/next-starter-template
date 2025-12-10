export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON body" }, null, 2),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const name = String((body as any).name ?? "").trim();
    const email = String((body as any).email ?? "").trim().toLowerCase();

    if (!name || !email) {
      return new Response(
        JSON.stringify(
          { ok: false, error: "Both 'name' and 'email' are required" },
          null,
          2
        ),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Very basic email sanity check, just to reject obvious junk
    if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid email format" }, null, 2),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await env.DB.prepare(
      "INSERT INTO join_requests (name, email) VALUES (?, ?);"
    )
      .bind(name, email)
      .run();

    const insertedId =
      (result as any)?.meta?.last_row_id ?? (result as any)?.meta?.lastRowId ?? null;

    return new Response(
      JSON.stringify(
        {
          ok: true,
          id: insertedId,
          message: "Join request stored",
        },
        null,
        2
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify(
        {
          ok: false,
          error: String(err?.message ?? err),
        },
        null,
        2
      ),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
