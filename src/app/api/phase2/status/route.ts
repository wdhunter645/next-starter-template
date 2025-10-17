import { NextResponse } from "next/server";

/**
 * GET /api/phase2/status
 * Returns a JSON health summary of Phase 2 integrations.
 * Shows which services are configured and available.
 */
export async function GET() {
  const supabaseConfigured = 
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const b2Configured = 
    !!process.env.B2_KEY_ID && 
    !!process.env.B2_APP_KEY && 
    !!process.env.B2_BUCKET;
  
  const adminConfigured = !!process.env.ADMIN_EMAILS;
  
  const githubOAuthConfigured = 
    !!process.env.GITHUB_APP_CLIENT_ID && 
    !!process.env.GITHUB_APP_CLIENT_SECRET;

  const status = {
    ok: true,
    timestamp: new Date().toISOString(),
    services: {
      supabase: {
        configured: supabaseConfigured,
        status: supabaseConfigured ? "available" : "not configured",
      },
      b2: {
        configured: b2Configured,
        status: b2Configured ? "available" : "not configured",
      },
      admin: {
        configured: adminConfigured,
        status: adminConfigured ? "available" : "not configured",
      },
      githubOAuth: {
        configured: githubOAuthConfigured,
        status: githubOAuthConfigured ? "available" : "not configured",
      },
    },
  };

  return NextResponse.json(status);
}
