// functions/api/env/check.ts
// Admin-only env validation endpoint. Returns 403 for non-admins.
//
// Never expose missing bindings publicly.
//
// GET /api/env/check

import { requireAdminMember } from "../../_lib/session";
import { checkEnv } from "../../_lib/env";

export const onRequestGet = async (context: any): Promise<Response> => {
  const auth = await requireAdminMember(context);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const env = context.env || {};

  // Keep this list minimal and stable. Add more only when the code requires it.
  const missing = checkEnv({
    env,
    requiredBindings: [
      { key: "DB", hint: "D1 binding required" },
      { key: "API_RATE_LIMITER", hint: "Rate limiting binding (ZIP 4)" },
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
