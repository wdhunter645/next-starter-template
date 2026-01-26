// Environment variable and binding validation utilities
// Provides fail-fast checks that halt execution when required bindings/envs are missing
// Only reports binding/env names, never values or secrets

export interface Env {
  DB?: any;
  ADMIN_TOKEN?: string;
  MAILCHANNELS_API_KEY?: string;
  RATE_LIMIT?: any;
  [key: string]: any;
}

export interface EnvCheckResult {
  ok: boolean;
  missing?: string[];
  error?: string;
  detail?: string;
}

/**
 * Check for required environment variables and bindings
 * Returns name-only diagnostics, never logs or returns secrets
 * 
 * @param env - Cloudflare environment object
 * @param required - Array of required binding/env names
 * @returns EnvCheckResult indicating success or missing bindings by name
 */
export function requireEnv(env: Env, required: string[]): EnvCheckResult {
  const missing: string[] = [];
  
  for (const key of required) {
    const value = env[key];
    // Check if binding/env is missing or empty
    if (value === undefined || value === null || value === '') {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      error: 'Required environment variables or bindings are missing',
      detail: `Missing: ${missing.join(', ')}. Configure these in wrangler.toml (local) or Cloudflare Pages settings (production).`
    };
  }
  
  return { ok: true };
}

/**
 * Create a fail-fast JSON error response for missing environment requirements
 * Only includes binding/env names, never values
 */
export function envErrorResponse(check: EnvCheckResult, status: number = 503): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: check.error || 'Configuration error',
      detail: check.detail,
      missing: check.missing
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Get diagnostics for all known environment variables and bindings
 * Returns name-only status, never values or secrets
 * 
 * @param env - Cloudflare environment object
 * @returns Object mapping env names to presence status
 */
export function getEnvDiagnostics(env: Env): Record<string, 'present' | 'missing'> {
  const knownEnvVars = [
    'DB',
    'ADMIN_TOKEN',
    'MAILCHANNELS_API_KEY',
    'RATE_LIMIT'
  ];
  
  const diagnostics: Record<string, 'present' | 'missing'> = {};
  
  for (const key of knownEnvVars) {
    const value = env[key];
    diagnostics[key] = (value !== undefined && value !== null && value !== '') ? 'present' : 'missing';
  }
  
  return diagnostics;
}
