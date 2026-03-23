import { requireMember } from "../../_lib/session";

export const onRequestPost = async (context: any): Promise<Response> => {
  const auth = await requireMember(context);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await context.request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON body" }, null, 2),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const name = String((body as any).name ?? "").trim();
    const title = String((body as any).title ?? "").trim();
    const content = String((body as any).content ?? "").trim();

    // email is derived from the authenticated session — never trust client input
    const email = auth.email;

    if (!name || !title || !content) {
      return new Response(
        JSON.stringify(
          {
            ok: false,
            error: "Fields 'name', 'title', and 'content' are all required",
          },
          null,
          2
        ),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await auth.db.prepare(
      "INSERT INTO library_entries (name, email, title, content) VALUES (?, ?, ?, ?);"
    )
      .bind(name, email, title, content)
      .run();

    const insertedId =
      (result as any)?.meta?.last_row_id ?? (result as any)?.meta?.lastRowId ?? null;

    return new Response(
      JSON.stringify(
        {
          ok: true,
          id: insertedId,
          message: "Library entry stored",
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
