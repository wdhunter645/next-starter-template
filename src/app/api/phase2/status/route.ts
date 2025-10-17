import { NextResponse } from 'next/server';

/**
 * Phase 2 Status API
 * 
 * Returns a JSON health summary for Phase 2 features.
 * This endpoint checks the status of various services and configurations.
 * 
 * GET /api/phase2/status
 */

export async function GET() {
	// Check environment variables
	const hasSupabase = !!(
		process.env.NEXT_PUBLIC_SUPABASE_URL &&
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	);
	
	const hasSupabaseServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
	
	const hasAdminConfig = !!process.env.ADMIN_EMAILS;
	
	const hasB2Config = !!(
		process.env.B2_APPLICATION_KEY_ID &&
		process.env.B2_APPLICATION_KEY &&
		process.env.B2_BUCKET_NAME &&
		process.env.B2_ENDPOINT
	);

	// Overall health status
	const isHealthy = hasSupabase && hasAdminConfig;

	return NextResponse.json({
		status: isHealthy ? 'healthy' : 'degraded',
		timestamp: new Date().toISOString(),
		checks: {
			supabase: {
				configured: hasSupabase,
				serviceRole: hasSupabaseServiceKey,
				status: hasSupabase ? 'ok' : 'missing',
			},
			admin: {
				configured: hasAdminConfig,
				status: hasAdminConfig ? 'ok' : 'missing',
			},
			storage: {
				configured: hasB2Config,
				status: hasB2Config ? 'ok' : 'not_configured',
				optional: true,
			},
		},
		features: {
			authentication: hasSupabase ? 'available' : 'unavailable',
			adminPanel: hasAdminConfig ? 'available' : 'unavailable',
			fileUploads: hasB2Config ? 'available' : 'unavailable',
		},
		message: isHealthy
			? 'Phase 2 is operational'
			: 'Some required services are not configured',
	});
}
