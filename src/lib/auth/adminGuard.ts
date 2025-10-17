/**
 * Admin Guard - Server-side only
 * 
 * Checks if the current user has admin privileges based on:
 * 1. Authentication status (must have a session)
 * 2. Email address in ADMIN_EMAILS environment variable
 * 
 * This is a placeholder implementation that checks against the ADMIN_EMAILS
 * environment variable. In a production app with full auth, you would:
 * 1. Extract user email from session/JWT
 * 2. Verify the session is valid
 * 3. Check if email is in admin list
 * 
 * Usage:
 * ```typescript
 * import { checkAdminAccess } from '@/lib/auth/adminGuard';
 * 
 * export async function GET(request: NextRequest) {
 *   const adminCheck = await checkAdminAccess(request);
 *   if (!adminCheck.authorized) {
 *     return NextResponse.json(
 *       { error: adminCheck.reason },
 *       { status: adminCheck.status }
 *     );
 *   }
 *   // Proceed with admin operation
 * }
 * ```
 */

import { NextRequest } from 'next/server';

export interface AdminCheckResult {
	authorized: boolean;
	status: number;
	reason: string;
	userEmail?: string;
}

/**
 * Check if the request has admin access
 * 
 * @param request - The Next.js request object
 * @returns AdminCheckResult with authorization status
 */
export async function checkAdminAccess(
	request: NextRequest
): Promise<AdminCheckResult> {
	// Get admin emails from environment
	const adminEmailsEnv = process.env.ADMIN_EMAILS;
	
	if (!adminEmailsEnv) {
		return {
			authorized: false,
			status: 503,
			reason: 'Admin configuration missing',
		};
	}

	const adminEmails = adminEmailsEnv
		.split(',')
		.map((email) => email.trim().toLowerCase())
		.filter((email) => email.length > 0);

	if (adminEmails.length === 0) {
		return {
			authorized: false,
			status: 503,
			reason: 'No admin emails configured',
		};
	}

	// TODO: In a real implementation, extract user email from session/JWT
	// For now, this is a placeholder that will check headers for testing
	// When you integrate with Supabase auth or another provider:
	// 1. Extract the session token from cookies/headers
	// 2. Verify the token is valid
	// 3. Extract the user's email from the verified session
	// 4. Check if that email is in the admin list
	
	// Placeholder: Check for a test header (NOT SECURE - for development only)
	const userEmail = request.headers.get('x-user-email')?.toLowerCase();
	
	if (!userEmail) {
		return {
			authorized: false,
			status: 401,
			reason: 'Not authenticated',
		};
	}

	if (!adminEmails.includes(userEmail)) {
		return {
			authorized: false,
			status: 403,
			reason: 'Insufficient permissions',
		};
	}

	return {
		authorized: true,
		status: 200,
		reason: 'Authorized',
		userEmail,
	};
}

/**
 * Helper to get admin emails list from environment
 * Server-side only
 */
export function getAdminEmails(): string[] {
	const adminEmailsEnv = process.env.ADMIN_EMAILS;
	if (!adminEmailsEnv) {
		return [];
	}
	return adminEmailsEnv
		.split(',')
		.map((email) => email.trim().toLowerCase())
		.filter((email) => email.length > 0);
}
