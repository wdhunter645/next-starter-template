/**
 * Phase 2 Features Status API
 * Returns implementation status of phase 2 features
 */
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
	// Track phase 2 feature implementation status
	const features = {
		supabaseIntegration: {
			implemented: true,
			endpoints: ['/api/supabase/status'],
		},
		b2StorageIntegration: {
			implemented: true,
			endpoints: ['/api/admin/b2/presign', '/api/admin/b2/sync'],
		},
		githubOAuth: {
			implemented: true,
			endpoints: ['/api/auth/callback'],
		},
		adminPortal: {
			implemented: true,
			routes: ['/admin'],
		},
		memberPortal: {
			implemented: true,
			routes: ['/member'],
		},
		contentPages: {
			implemented: true,
			routes: ['/weekly', '/milestones', '/news', '/calendar'],
		},
	};

	const allImplemented = Object.values(features).every((f) => f.implemented);

	return NextResponse.json({
		ok: true,
		phase: 2,
		status: allImplemented ? 'complete' : 'in-progress',
		features,
		timestamp: new Date().toISOString(),
	});
}
