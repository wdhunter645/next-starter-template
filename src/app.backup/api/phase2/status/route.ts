export const runtime = 'edge';

import { NextResponse } from "next/server";
import packageJson from "../../../../../package.json";

/**
 * Phase 2 Status API
 * 
 * Returns a simple health summary with build info and route verification.
 * This is a read-only endpoint safe for public access.
 */

// List of expected routes
const EXPECTED_ROUTES = [
	"/",
	"/weekly",
	"/milestones",
	"/charities",
	"/news",
	"/calendar",
	"/privacy",
	"/terms",
	"/member",
	"/admin",
];

export async function GET() {
	const commitSha = process.env.CF_PAGES_COMMIT_SHA || 
	                  process.env.VERCEL_GIT_COMMIT_SHA || 
	                  "unknown";
	const shortSha = commitSha !== "unknown" ? commitSha.substring(0, 7) : "unknown";
	
	const buildDate = process.env.BUILD_DATE || new Date().toISOString();
	
	const envName = process.env.CF_PAGES_BRANCH || 
	                process.env.VERCEL_ENV || 
	                process.env.NODE_ENV || 
	                "development";
	
	return NextResponse.json({
		ok: true,
		timestamp: new Date().toISOString(),
		build: {
			version: packageJson.version,
			commit: shortSha,
			date: buildDate,
			environment: envName,
		},
		routes: {
			expected: EXPECTED_ROUTES,
			count: EXPECTED_ROUTES.length,
		},
		checks: {
			packageJson: !!packageJson.version,
			nextRuntime: typeof process !== "undefined",
		},
	});
}
