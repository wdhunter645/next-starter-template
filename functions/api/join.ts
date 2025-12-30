// Cloudflare Pages Function for POST /api/join
// - Stores a join request in D1 `join_requests`
// - Sends welcome email via MailChannels
// - Returns 409 for duplicate emails (idempotent)

import { assertEmailEnvOrThrow, sendAdminJoinNotification, sendWelcomeEmail } from "../_lib/email";

// Helper: create JSON Response
function json(data: any, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type EmailLogResult = {
  result: "sent" | "failed" | "skipped";
  provider: string;
  statusCode?: number;
  error?: string;
};

async function logEmailAttempt(opts: {
  db: any;
  requestId: string;
  messageType: "welcome" | "admin";
  recipientEmail: string;
  sendResult: { sent: boolean; provider: string; statusCode?: number; error?: string; skipped?: boolean };
}) {
  const { db, requestId, messageType, recipientEmail, sendResult } = opts;
  const result: EmailLogResult["result"] =
    sendResult.sent ? "sent" : (sendResult.skipped || sendResult.provider === "disabled") ? "skipped" : "failed";

  try {
    await db
      .prepare(
        `INSERT INTO join_email_log
          (request_id, message_type, recipient_email, result, provider, status_code, error)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
      )
      .bind(
        requestId,
        messageType,
        recipientEmail,
        result,
        String(sendResult.provider || "unknown"),
        sendResult.statusCode ?? null,
        sendResult.error ?? null
      )
      .run();
  } catch (e) {
    // Never fail the join flow because audit logging failed.
    console.error("join_email_log insert failed:", e);
  }
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

  // Phase 7 guardrail: if email is enabled, fail fast on missing required env vars.
  try {
    assertEmailEnvOrThrow(env);
  } catch (e: any) {
    return json(
      { ok: false, error: "Email is enabled but required configuration is missing.", detail: String(e?.message || e), requestId },
      500
    );
  }

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
      const db = env.DB as any;

      // Email (optional). Join succeeds even if email fails; results are returned and logged.
      const welcomeResult = await sendWelcomeEmail({ env, toEmail: email, toName: name });
      await logEmailAttempt({
        db,
        requestId,
        messageType: "welcome",
        recipientEmail: email,
        sendResult: welcomeResult,
      });

      const adminRecipients = String(env?.MAIL_ADMIN_TO || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

      const adminResult = await sendAdminJoinNotification({ env, name, email, requestId });
      for (const r of adminRecipients.length ? adminRecipients : [String(env?.MAIL_ADMIN_TO || "").trim()].filter(Boolean)) {
        await logEmailAttempt({
          db,
          requestId,
          messageType: "admin",
          recipientEmail: r,
          sendResult: adminResult,
        });
      }

      return json(
        {
          ok: true,
          status: "joined",
          requestId,
          email: {
            welcome: welcomeResult,
            admin: adminResult,
          },
        },
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