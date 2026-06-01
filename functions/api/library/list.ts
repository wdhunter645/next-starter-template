import { requireMember } from "../../_lib/session";

export const onRequestGet = async (context: any): Promise<Response> => {
  const auth = await requireMember(context);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { request } = context;

  try {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || "10")));

    const rows = await auth.db.prepare(
      "SELECT id, title, content, created_at FROM library_entries ORDER BY created_at DESC LIMIT ?;"
    )
      .bind(limit)
      .all();

    return new Response(
      JSON.stringify(
        {
          ok: true,
          items: rows.results ?? [],
        },
        null,
        2
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
