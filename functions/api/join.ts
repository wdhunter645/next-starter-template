// Cloudflare Pages Function for POST /api/join
// Stores a join request in the D1 `join_requests` table.

export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const nameRaw = typeof body.name === "string" ? body.name.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";

  if (!nameRaw || !emailRaw) {
    return new Response(
      JSON.stringify({ ok: false, error: "Name and email are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const db = (env as any).DB;
    if (!db || typeof db.prepare !== "function") {
      throw new Error("D1 binding 'DB' is not configured on env.");
    }

    const stmt = db.prepare(
      "INSERT INTO join_requests (name, email) VALUES (?1, ?2)"
    );
    await stmt.bind(nameRaw, emailRaw).run();

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error inserting join request:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to save join request." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
