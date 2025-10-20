export const runtime = 'edge';

import { NextResponse } from "next/server";

/**
 * Environment Variable Check API
 * 
 * Returns a list of required environment variable names and their presence status.
 * NEVER returns actual values - only names and boolean presence indicators.
 * 
 * This is safe for preview/staging environments and helps diagnose configuration issues.
 */

// List of environment variables to check
const ENV_VARS_TO_CHECK = [
	// Cloudflare
	"CLOUDFLARE_ACCOUNT_ID",
	"CLOUDFLARE_API_TOKEN",
	
	// Site
	"NEXT_PUBLIC_SITE_URL",
	"NEXT_PUBLIC_SITE_NAME",
	
	// Supabase
	"NEXT_PUBLIC_SUPABASE_URL",
	"NEXT_PUBLIC_SUPABASE_API_KEY",
	"SUPABASE_ACCESS_TOKEN",
	"SUPABASE_PROJECT_ID",
	"SUPABASE_DB_PASSWORD",
	
	// Admin
	"ADMIN_EMAILS",
	
	// B2 (optional)
	"B2_KEY_ID",
	"B2_APP_KEY",
	"B2_BUCKET",
	"B2_ENDPOINT",
	"PUBLIC_B2_BASE_URL",
	
	// GitHub OAuth
	"GITHUB_APP_CLIENT_ID",
	"GITHUB_APP_CLIENT_SECRET",
	"GITHUB_APP_ID",
	"GITHUB_APP_INSTALLATION_ID",
];

export async function GET() {
	const envStatus = ENV_VARS_TO_CHECK.map((varName) => ({
		name: varName,
		present: !!process.env[varName],
		required: !varName.includes("B2"), // B2 is optional
	}));
	
	const requiredCount = envStatus.filter(e => e.required).length;
	const requiredPresent = envStatus.filter(e => e.required && e.present).length;
	const optionalCount = envStatus.filter(e => !e.required).length;
	const optionalPresent = envStatus.filter(e => !e.required && e.present).length;
	
	return NextResponse.json({
		ok: requiredPresent === requiredCount,
		summary: {
			required: `${requiredPresent}/${requiredCount}`,
			optional: `${optionalPresent}/${optionalCount}`,
		},
		variables: envStatus,
	});
}
