// Cloudflare Pages Function for GET /api/env/check
// Diagnostics endpoint that reports environment variable and binding status
// Returns name-only diagnostics, NEVER values or secrets

import { getEnvDiagnostics, type Env } from '../../_lib/env';

export async function onRequestGet(context: { env: Env; request: Request }): Promise<Response> {
  const { env } = context;
  
  try {
    const diagnostics = getEnvDiagnostics(env);
    
    // Separate missing and present bindings for clearer reporting
    const missing = Object.entries(diagnostics)
      .filter(([_, status]) => status === 'missing')
      .map(([name]) => name);
    
    const present = Object.entries(diagnostics)
      .filter(([_, status]) => status === 'present')
      .map(([name]) => name);
    
    const allConfigured = missing.length === 0;
    
    return new Response(
      JSON.stringify({
        ok: allConfigured,
        status: allConfigured ? 'All required bindings configured' : 'Some bindings missing',
        diagnostics: {
          present,
          missing
        },
        note: 'This endpoint only reports binding/env names, never values or secrets.'
      }, null, 2),
      {
        status: allConfigured ? 200 : 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Diagnostics check failed',
        detail: error?.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
