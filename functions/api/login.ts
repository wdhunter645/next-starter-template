// Cloudflare Pages Function for POST /api/login
// - Validates that the email exists in join_requests
// - Does NOT send any email
// - Rate limits: max 3 failed attempts per IP per hour

function json(data: any, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    request.headers.get('X-Real-IP') ||
    'unknown'
  );
}

async function countRecentFailedAttempts(db: any, ip: string): Promise<number> {
  const res = await db
    .prepare(
      `SELECT COUNT(1) AS n
       FROM login_attempts
       WHERE ip = ?1 AND ok = 0 AND datetime(created_at) >= datetime('now','-1 hour')`
    )
    .bind(ip)
    .first();
  const n = Number((res as any)?.n ?? 0);
  return Number.isFinite(n) ? n : 0;
}

async function logAttempt(db: any, ip: string, email: string, ok: boolean) {
  try {
    await db
      .prepare(
        `INSERT INTO login_attempts (ip, email, ok, created_at)
         VALUES (?1, ?2, ?3, datetime('now'))`
      )
      .bind(ip, email, ok ? 1 : 0)
      .run();
  } catch (e) {
    // Never fail login just because logging failed.
    console.error('login_attempts insert failed:', e);
  }
}

async function emailExists(db: any, email: string): Promise<boolean> {
  const row = await db
    .prepare(`SELECT 1 AS ok FROM join_requests WHERE lower(email) = lower(?1) LIMIT 1`)
    .bind(email)
    .first();
  return Boolean((row as any)?.ok);
}

export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;
  const ip = getIp(request);
  const requestId = `login_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    const body = await request.json();
    const emailRaw = (body?.email ?? '').toString();
    const email = emailRaw.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return json({ ok: false, error: 'Email is required.', requestId }, 400);
    }

    const failed = await countRecentFailedAttempts(env.DB, ip);
    if (failed >= 3) {
      return json(
        { ok: false, error: 'Too many failed attempts. Please wait one hour and try again.', requestId },
        429
      );
    }

    const exists = await emailExists(env.DB, email);
    if (!exists) {
      await logAttempt(env.DB, ip, email, false);
      return json({ ok: false, error: 'Email not found.', requestId }, 404);
    }

    await logAttempt(env.DB, ip, email, true);
    return json({ ok: true, status: 'ok', requestId }, 200);
  } catch (e: any) {
    return json({ ok: false, error: 'Server error', requestId }, 500);
  }
}
