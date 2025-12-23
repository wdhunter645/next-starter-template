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

// Helper: check if error is a unique constraint violation
function isUniqueViolation(err: any): boolean {
  const errMsg = String(err?.message || err).toLowerCase();
  const errCode = String(err?.code || "").toUpperCase();
  return (
    errMsg.includes("unique constraint") ||
    errCode.includes("SQLITE_CONSTRAINT") ||
    errMsg.includes("constraint failed")
  );
}

// Helper: insert join request into DB
async function insertJoinRequest(
  db: any,
  data: { name: string; email: string }
): Promise<void> {
  const stmt = db.prepare(
    "INSERT INTO join_requests (name, email, created_at) VALUES (?1, ?2, datetime('now'))"
  );
  await stmt.bind(data.name, data.email).run();
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

    // Attempt insert (DB is authoritative)
    try {
      await insertJoinRequest(env.DB, { name, email });

      // SUCCESS: first-time join
      await sendWelcomeEmail({ env, toEmail: email, toName: name });

      return json(
        { ok: true, status: "joined", requestId },
        200
      );
    } catch (err: any) {
      // Duplicate constraint violation
      if (isUniqueViolation(err)) {
        return json(
          {
            ok: false,
            status: "already_subscribed",
            error: "Email already subscribed.",
            requestId,
          },
          409
        );
      }

      // Unknown DB error
      throw err;
    }
  } catch (err) {
    // Guaranteed fallback return (prevents TS fallthrough)
    return json(
      { ok: false, error: "Server error", requestId },
      500
    );
  }
}
