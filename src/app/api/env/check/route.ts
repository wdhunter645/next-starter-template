import { NextResponse } from "next/server";

/**
 * GET /api/env/check
 * Returns a list of required environment variables and whether they are set.
 * Never returns actual values - only presence/absence.
 */
export async function GET() {
  const envVars = {
    // Cloudflare
    CLOUDFLARE_ACCOUNT_ID: !!process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN: !!process.env.CLOUDFLARE_API_TOKEN,
    
    // Site
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: !!process.env.NEXT_PUBLIC_SITE_NAME,
    
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Admin
    ADMIN_EMAILS: !!process.env.ADMIN_EMAILS,
    
    // B2
    B2_KEY_ID: !!process.env.B2_KEY_ID,
    B2_APP_KEY: !!process.env.B2_APP_KEY,
    B2_BUCKET: !!process.env.B2_BUCKET,
    B2_ENDPOINT: !!process.env.B2_ENDPOINT,
    PUBLIC_B2_BASE_URL: !!process.env.PUBLIC_B2_BASE_URL,
    
    // Worker
    WORKER_BASE_URL: !!process.env.WORKER_BASE_URL,
    NEXT_PUBLIC_WORKER_BASE_URL: !!process.env.NEXT_PUBLIC_WORKER_BASE_URL,
    
    // GitHub App OAuth
    GITHUB_APP_CLIENT_ID: !!process.env.GITHUB_APP_CLIENT_ID,
    GITHUB_APP_CLIENT_SECRET: !!process.env.GITHUB_APP_CLIENT_SECRET,
    GITHUB_APP_ID: !!process.env.GITHUB_APP_ID,
    GITHUB_APP_INSTALLATION_ID: !!process.env.GITHUB_APP_INSTALLATION_ID,
  };

  return NextResponse.json(envVars);
}
