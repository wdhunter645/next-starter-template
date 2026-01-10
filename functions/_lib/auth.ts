export function requireAdmin(request: Request, env: any): Response | null {
  const token = request.headers.get("x-admin-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expected = String(env?.ADMIN_TOKEN || "").trim();

  // If not configured, fail closed.
  if (!expected) {
    return new Response(
      JSON.stringify({ ok: false, error: "Admin access is not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!token || token !== expected) {
    return new Response(
      JSON.stringify({ ok: false, error: "Unauthorized." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return null;
}

/**
 * requireAdminEmail - Enhanced admin gate using ADMIN_EMAILS allowlist
 * 
 * This function enforces server-side admin access control based on:
 * 1. ADMIN_TOKEN validation (shared secret)
 * 2. ADMIN_EMAILS allowlist (comma-separated email list)
 * 
 * For now, since there's no user auth/session in LGFC-Lite, we rely on ADMIN_TOKEN.
 * The email parameter is optional and can be used when auth is added later.
 * 
 * @param request - Request object
 * @param env - Environment object with ADMIN_TOKEN and ADMIN_EMAILS
 * @param email - Optional user email (for future auth integration)
 * @returns Response with error or null if authorized
 */
export function requireAdminEmail(request: Request, env: any, email?: string): Response | null {
  const token = request.headers.get("x-admin-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expectedToken = String(env?.ADMIN_TOKEN || "").trim();
  const adminEmails = String(env?.ADMIN_EMAILS || "").trim();

  // If ADMIN_TOKEN not configured, fail closed
  if (!expectedToken) {
    return new Response(
      JSON.stringify({ ok: false, error: "Admin access is not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate ADMIN_TOKEN
  if (!token || token !== expectedToken) {
    return new Response(
      JSON.stringify({ ok: false, error: "Unauthorized." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // If ADMIN_EMAILS is configured and email is provided, validate email allowlist
  if (adminEmails && email) {
    const allowedEmails = adminEmails.split(',').map(e => e.trim().toLowerCase());
    const userEmail = email.trim().toLowerCase();
    
    if (!allowedEmails.includes(userEmail)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Forbidden. Email not in admin allowlist." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return null;
}
