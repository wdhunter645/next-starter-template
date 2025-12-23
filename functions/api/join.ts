// Cloudflare Pages Function for POST /api/join
// - Stores a join request in D1 `join_requests`
// - Sends welcome email + admin notification via MailChannels (Phase 6)
// - Writes an audit row per email attempt in D1 `join_email_log`

import { assertEmailEnvOrThrow, sendAdminJoinNotification, sendWelcomeEmail } from "../_lib/email";

type EmailAttempt = {
  messageType: "welcome" | "admin";
  recipientEmail: string;
  sent: boolean;
  provider: string;
  statusCode?: number;
  error?: string;
  skipped?: boolean;
};

async function writeEmailLog(env: any, attempt: EmailAttempt, requestId: string): Promise<void> {
  try {
    const db = env.DB as any;
    const stmt = db.prepare(
      "INSERT INTO join_email_log (request_id, message_type, recipient_email, result, provider, status_code, error) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
    );
    let result: string;
    if (attempt.sent) {
      result = "sent";
    } else if (attempt.skipped || attempt.provider === "disabled") {
      result = "skipped";
    } else {
      result = "failed";
    }
    await stmt
      .bind(
        requestId,
        attempt.messageType,
        attempt.recipientEmail,
        result,
        attempt.provider || "unknown",
        typeof attempt.statusCode === "number" ? attempt.statusCode : null,
        attempt.error ? String(attempt.error).slice(0, 600) : null
      )
      .run();
  } catch (e: any) {
    // Do not fail the request if logging fails, but do log loudly.
    console.error("join: failed to write join_email_log", {
      requestId,
      messageType: attempt.messageType,
      error: String(e?.message || e),
    });
  }
}

export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const nameRaw = typeof body?.name === "string" ? body.name.trim() : "";
  const emailRaw = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const emailDomain = emailRaw.includes("@") ? emailRaw.split("@")[1] : "unknown";

  console.log("join: request received", {
    requestId,
    emailDomain,
    hasName: !!nameRaw,
  });

  if (!nameRaw || !emailRaw) {
    return new Response(JSON.stringify({ ok: false, error: "Name and email are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const db = env.DB as any;

    // 1) Attempt INSERT first (authoritative, DB-level idempotency via UNIQUE constraint)
    try {
      const stmt = db.prepare("INSERT INTO join_requests (name, email, created_at) VALUES (?1, ?2, datetime('now'))");
      await stmt.bind(nameRaw, emailRaw).run();
      console.log("join: new subscription created", { requestId, emailDomain });
    } catch (insertErr: any) {
      // Check if error is UNIQUE constraint violation
      const errMsg = String(insertErr?.message || insertErr).toLowerCase();
      if (errMsg.includes("unique") || errMsg.includes("constraint")) {
        // Duplicate email - return 409 immediately (no email sent)
        console.log("join: duplicate email detected (UNIQUE constraint)", { requestId, emailDomain });
        return new Response(
          JSON.stringify({
            ok: false,
            status: "already_subscribed",
            error: "Email already subscribed.",
            requestId,
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      // Re-throw if it's a different DB error
      throw insertErr;
    }

    // 2) Email + admin ops (Phase 6) - only if INSERT succeeded
    const mailEnabled = String(env?.MAILCHANNELS_ENABLED || "0") === "1";

    if (!mailEnabled) {
      return new Response(JSON.stringify({ ok: true, email: { enabled: false } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fail fast if required env vars are missing
    try {
      assertEmailEnvOrThrow(env);
    } catch (e: any) {
      console.error("join: email env misconfigured", { requestId, error: String(e?.message || e) });
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Email system misconfigured (server).",
          requestId,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send welcome email (INSERT succeeded, this is a new join)
    const welcome = await sendWelcomeEmail({
      env,
      toEmail: emailRaw,
      toName: nameRaw,
      siteUrl: String(env?.NEXT_PUBLIC_SITE_URL || ""),
    });

    const welcomeAttempt: EmailAttempt = {
      messageType: "welcome",
      recipientEmail: emailRaw,
      sent: !!welcome.sent,
      provider: welcome.provider || "mailchannels",
      statusCode: welcome.statusCode,
      error: welcome.error,
    };
    await writeEmailLog(env, welcomeAttempt, requestId);

    // Admin notification (non-fatal)
    const admin = await sendAdminJoinNotification({
      env,
      name: nameRaw,
      email: emailRaw,
      requestId,
      siteUrl: String(env?.NEXT_PUBLIC_SITE_URL || ""),
    });

    const adminTo = String(env?.MAIL_ADMIN_TO || "").trim() || "not-configured";
    const adminAttempt: EmailAttempt = {
      messageType: "admin",
      recipientEmail: adminTo,
      sent: !!admin.sent,
      provider: admin.provider || "mailchannels",
      statusCode: admin.statusCode,
      error: admin.error,
      skipped: admin.skipped,
    };
    await writeEmailLog(env, adminAttempt, requestId);

    console.log("join: email results", {
      requestId,
      welcomeSent: !!welcome.sent,
      welcomeStatus: welcome.statusCode,
      adminSent: !!admin.sent,
      adminStatus: admin.statusCode,
      adminSkipped: !!admin.skipped,
    });

    // Success when join inserted and welcome sent
    if (!welcome.sent) {
      return new Response(
        JSON.stringify({
          ok: false,
          requestId,
          error: "Failed to send welcome email.",
          email: {
            welcome: { sent: false, provider: welcome.provider, statusCode: welcome.statusCode, error: welcome.error || null },
          },
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Welcome sent successfully - return success even if admin failed
    const responseData: any = {
      ok: true,
      status: "joined",
      requestId,
      email: {
        welcome: { sent: true, provider: welcome.provider, statusCode: welcome.statusCode },
      },
    };

    // Add warning if admin notification was skipped or failed
    if (admin.skipped) {
      responseData.warn = "admin_notify_skipped";
    } else if (!admin.sent) {
      responseData.warn = "admin_notify_failed";
    }

    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("join: error", { requestId, error: String(err?.message || err) });
    return new Response(JSON.stringify({ ok: false, error: "Failed to save join request.", requestId }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
