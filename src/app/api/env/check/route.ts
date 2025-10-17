/**
 * Environment Check API
 * Returns basic environment configuration status
 */
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
	const env = process.env as Record<string, string | undefined>;

	// Check critical environment variables
	const checks = {
		siteUrl: !!env.NEXT_PUBLIC_SITE_URL,
		adminEmails: !!env.ADMIN_EMAILS,
		supabaseUrl: !!env.NEXT_PUBLIC_SUPABASE_URL,
		supabaseAnon: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		b2Configured: !!(env.B2_KEY_ID && env.B2_APP_KEY && env.B2_BUCKET && env.B2_ENDPOINT),
		githubOAuth: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
	};

	return NextResponse.json({
		ok: true,
		environment: env.NODE_ENV || 'development',
		checks,
		timestamp: new Date().toISOString(),
	});
}
