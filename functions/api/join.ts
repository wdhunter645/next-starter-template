// Cloudflare Pages Function for POST /api/join
// - Stores a join request in D1 `join_requests`
// - Sends welcome email via MailChannels
// - Returns 409 for duplicate emails (idempotent)

import { sendWelcomeEmail } from "../_lib/email";

// Helper: create JSON Response
function json(data: any, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Helper: insert join request into DB using INSERT...SELECT...WHERE NOT EXISTS
// Returns true if inserted (new record), false if duplicate (already exists)
async function insertJoinRequest(
  db: any,
  data: { name: string; email: string }
): Promise<boolean> {
  const stmt = db.prepare(
    `INSERT INTO join_requests (name, email, created_at)
     SELECT ?1, ?2, datetime('now')
     WHERE NOT EXISTS (
       SELECT 1 FROM join_requests WHERE lower(email) = lower(?2)
     )`
  );
  const result = await stmt.bind(data.name, data.email).run();
  // If changes === 1, insert succeeded (new record)
  // If changes === 0, duplicate was detected (no insert)
  return result.meta.changes === 1;
}

export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;
  const requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 11)}`;

  try {
    const body = await request.json();
    const name = (body?.name ?? "").toString().trim();
    const emailRaw = (body?.email ?? "").toString();
    const email = emailRaw.trim().toLowerCase();

    if (!name || !email) {
      return json(
        { ok: false, error: "Name and email are required.", requestId },
        400
      );
    }

    // Attempt insert using INSERT...SELECT...WHERE NOT EXISTS
    const inserted = await insertJoinRequest(env.DB, { name, email });

    if (inserted) {
      // SUCCESS: first-time join (insert occurred)
      await sendWelcomeEmail({ env, toEmail: email, toName: name });

      return json(
        { ok: true, status: "joined", requestId },
        200
      );
    } else {
      // DUPLICATE: email already exists (no insert)
      return json(
        {
          ok: false,
          status: "already_joined",
          requestId,
        },
        409
      );
    }
  } catch (err) {
    // Guaranteed fallback return (prevents TS fallthrough)
    return json(
      { ok: false, error: "Server error", requestId },
      500
    );
  }
}
