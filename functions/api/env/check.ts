// functions/api/env/check.ts
// Fail-fast env validation (diagnostic endpoint).
// Admin-only: requires authenticated admin session.
//
// Returns missing keys by NAME ONLY (never values).
//
// GET /api/env/check

import { checkEnv } from "../../_lib/env";
import { requireAdminMember } from "../../_lib/session";

export const onRequestGet = async (context: any): Promise<Response> => {
  const admin = await requireAdminMember(context);
  if (!admin.ok) {
    return new Response(
      JSON.stringify(admin.body),
      { status: admin.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const env = context.env || {};

  const missing = checkEnv({
    env,
    requiredBindings: [
      { key: "DB", hint: "D1 binding required" },
      { key: "API_RATE_LIMITER", hint: "Rate limiting binding" },
    ],
    requiredStrings: [
      { key: "NEXT_PUBLIC_SITE_URL", hint: "Public site URL" },
      { key: "ADMIN_EMAILS", hint: "Comma-separated admin allowlist" },
    ],
  });

  return new Response(
    JSON.stringify({
      ok: missing.length === 0,
      missing,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
