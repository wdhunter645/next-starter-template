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
