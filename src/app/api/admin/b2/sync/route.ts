import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isUserAdmin } from "@/lib/auth/adminGuard";

/**
 * B2 Sync API (Admin Only) - STUB
 * 
 * Stub endpoint for syncing media to B2 storage.
 * This endpoint is feature-flagged - returns 503 if B2 not configured.
 * 
 * Security:
 * - Requires authentication (session)
 * - Requires admin role (ADMIN_EMAILS)
 * - Returns 401 if not authenticated
 * - Returns 403 if not admin
 * - Returns 503 if B2 env vars missing
 * 
 * This ensures the endpoint degrades gracefully and never crashes CI.
 */

// Check if B2 is configured
function isB2Configured(): boolean {
	return !!(
		process.env.B2_KEY_ID &&
		process.env.B2_APP_KEY &&
		process.env.B2_BUCKET &&
		process.env.B2_ENDPOINT
	);
}

// Get missing B2 environment variables
function getMissingB2Vars(): string[] {
	const missing: string[] = [];
	if (!process.env.B2_KEY_ID) missing.push("B2_KEY_ID");
	if (!process.env.B2_APP_KEY) missing.push("B2_APP_KEY");
	if (!process.env.B2_BUCKET) missing.push("B2_BUCKET");
	if (!process.env.B2_ENDPOINT) missing.push("B2_ENDPOINT");
	return missing;
}

export async function POST() {
	// Check authentication
	const session = await getSession();
	
	if (!session.user) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 }
		);
	}
	
	// Check admin role
	const isAdmin = isUserAdmin(session.user.email);
	
	if (!isAdmin) {
		return NextResponse.json(
			{ error: "Admin access required" },
			{ status: 403 }
		);
	}
	
	// Check if B2 is configured
	if (!isB2Configured()) {
		const missing = getMissingB2Vars();
		return NextResponse.json(
			{
				error: "Service unavailable",
				reason: "B2 storage is not configured",
				missing: missing,
				message: "B2 sync requires environment variables",
			},
			{ status: 503 }
		);
	}
	
	// TODO: Implement actual B2 sync logic
	// This would typically:
	// 1. List files from source (e.g., local uploads)
	// 2. Compare with B2 bucket contents
	// 3. Upload new/changed files
	// 4. Return sync summary
	
	return NextResponse.json({
		success: true,
		message: "B2 sync endpoint ready",
		note: "TODO: Implement sync logic",
		stub: true,
	});
}
