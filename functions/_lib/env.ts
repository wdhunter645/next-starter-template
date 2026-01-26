// functions/_lib/env.ts
// Fail-fast, non-secret-leaking environment validation helpers.
//
// Rules:
// - Never log secret values.
// - Only report missing key names.
// - Keep this module dependency-free (safe for Pages Functions).

export type Missing = { key: string; hint?: string };

export function getString(env: Record<string, any>, key: string): string {
  const v = String(env?.[key] ?? "").trim();
  return v;
}

export function requireString(env: Record<string, any>, key: string, hint?: string): string {
  const v = getString(env, key);
  if (!v) {
    throw new Error(`Missing required env var: ${key}${hint ? ` (${hint})` : ""}`);
  }
  return v;
}

export function hasBinding(env: Record<string, any>, key: string): boolean {
  return Boolean(env && Object.prototype.hasOwnProperty.call(env, key) && env[key]);
}

/**
 * checkEnv:
 * Returns a list of missing env keys/bindings, without throwing.
 */
export function checkEnv(opts: {
  env: Record<string, any>;
  requiredStrings?: Array<{ key: string; hint?: string }>;
  requiredBindings?: Array<{ key: string; hint?: string }>;
}): Missing[] {
  const missing: Missing[] = [];
  for (const item of opts.requiredStrings || []) {
    if (!getString(opts.env, item.key)) missing.push({ key: item.key, hint: item.hint });
  }
  for (const item of opts.requiredBindings || []) {
    if (!hasBinding(opts.env, item.key)) missing.push({ key: item.key, hint: item.hint });
  }
  return missing;
}

/**
 * jsonMissingResponse:
 * Helper to return a consistent 500 JSON response for missing env/bindings.
 */
export function jsonMissingResponse(missing: Missing[], requestId?: string): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "missing_env",
      requestId: requestId || undefined,
      missing: missing.map((m) => ({ key: m.key, hint: m.hint })),
    }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
