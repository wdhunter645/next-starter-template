import { requireD1, type Env } from "./d1";

function parseCookies(h: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!h) return out;
  const parts = h.split(";");
  for (const p of parts) {
    const idx = p.indexOf("=");
    if (idx <= 0) continue;
    const k = p.slice(0, idx).trim();
    const v = p.slice(idx + 1).trim();
    if (!k) continue;
    out[k] = decodeURIComponent(v);
  }
  return out;
}

export function getSessionId(request: Request): string {
  const cookies = parseCookies(request.headers.get("Cookie"));
  return String(cookies["lgfc_session"] || "").trim();
}

export function newSessionIdHex(bytes = 24): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function setSessionCookie(sessionId: string): string {
  // 30 days, HttpOnly, Secure, SameSite=Lax, path=/
  const maxAge = 60 * 60 * 24 * 30;
  return `lgfc_session=${encodeURIComponent(sessionId)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie(): string {
  return `lgfc_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export async function getSessionEmail(db: any, sessionId: string): Promise<string> {
  if (!sessionId) return "";
  const row = await db
    .prepare(
      `SELECT email
       FROM member_sessions
       WHERE id = ?1
         AND datetime(expires_at) > datetime('now')
       LIMIT 1`
    )
    .bind(sessionId)
    .first();
  return String((row as any)?.email || "").trim().toLowerCase();
}

export async function touchSession(db: any, sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    await db
      .prepare(`UPDATE member_sessions SET last_seen_at = datetime('now') WHERE id = ?1`)
      .bind(sessionId)
      .run();
  } catch {
    // never block
  }
}

export async function getMemberRole(db: any, email: string): Promise<"admin" | "member"> {
  if (!email) return "member";
  const row = await db
    .prepare(`SELECT role FROM members WHERE lower(email) = lower(?1) LIMIT 1`)
    .bind(email)
    .first();
  const role = String((row as any)?.role || "member").toLowerCase();
  return role === "admin" ? "admin" : "member";
}

export async function requireMember(context: { env: Env; request: Request }) {
  const { env, request } = context;
  const d1 = requireD1(env);
  if (!d1.ok) return { ok: false as const, status: d1.status, body: d1.body };

  const db = d1.db;
  const sessionId = getSessionId(request);
  const email = await getSessionEmail(db, sessionId);

  if (!email) {
    return { ok: false as const, status: 401, body: { ok: false, error: "Not authenticated" } };
  }

  await touchSession(db, sessionId);
  return { ok: true as const, db, email, sessionId };
}

export async function requireAdminMember(context: { env: Env; request: Request }) {
  const m = await requireMember(context);
  if (!m.ok) return m;

  const role = await getMemberRole(m.db, m.email);
  if (role !== "admin") {
    return { ok: false as const, status: 403, body: { ok: false, error: "Admin required" } };
  }

  return { ok: true as const, db: m.db, email: m.email, sessionId: m.sessionId, role };
}
