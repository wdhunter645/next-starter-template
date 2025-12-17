// Cloudflare Pages Function for POST /api/join
// Stores a join request in the D1 `join_requests` table.
// Optionally sends a welcome email (Phase 6) if MAILCHANNELS_ENABLED=1.

import { sendWelcomeEmail } from "../_lib/email";

export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const nameRaw = typeof body?.name === "string" ? body.name.trim() : "";
  const emailRaw = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!nameRaw || !emailRaw) {
    return new Response(JSON.stringify({ ok: false, error: "Name and email are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const db = env.DB as any;

    const stmt = db.prepare(
      "INSERT INTO join_requests (name, email, created_at) VALUES (?1, ?2, datetime('now'))"
    );

    await stmt.bind(nameRaw, emailRaw).run();

    // Optional email (does not affect join success)
    const emailResult = await sendWelcomeEmail({
      env,
      toEmail: emailRaw,
      toName: nameRaw,
      siteUrl: String(env?.NEXT_PUBLIC_SITE_URL || ""),
    });

    return new Response(
      JSON.stringify({
        ok: true,
        email: { sent: emailResult.sent, provider: emailResult.provider, error: emailResult.error || null },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error inserting join request:", err);
    return new Response(JSON.stringify({ ok: false, error: "Failed to save join request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
