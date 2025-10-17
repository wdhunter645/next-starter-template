import { NextResponse } from 'next/server';

/**
 * Environment Check API
 * 
 * Returns a list of required environment variables and their presence status.
 * Does NOT return actual values for security.
 * 
 * GET /api/env/check
 */

export async function GET() {
	const requiredVars = [
		'NEXT_PUBLIC_SUPABASE_URL',
		'NEXT_PUBLIC_SUPABASE_ANON_KEY',
		'SUPABASE_SERVICE_ROLE_KEY',
		'ADMIN_EMAILS',
		'B2_KEY_ID',
		'B2_APP_KEY',
		'B2_BUCKET',
		'B2_ENDPOINT',
	];

	const envCheck = requiredVars.map((varName) => ({
		name: varName,
		present: !!process.env[varName],
	}));

	const allPresent = envCheck.every((check) => check.present);

	return NextResponse.json({
		status: allPresent ? 'ok' : 'incomplete',
		variables: envCheck,
		summary: {
			total: requiredVars.length,
			present: envCheck.filter((check) => check.present).length,
			missing: envCheck.filter((check) => !check.present).length,
		},
	});
}
