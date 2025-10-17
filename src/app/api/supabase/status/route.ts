import { NextResponse } from "next/server";
import { getSupabaseStatus } from "@/lib/supabase/serverClient";

/**
 * Supabase Status API
 * 
 * Returns configuration status for Supabase connection.
 * Does NOT expose actual values - only presence indicators.
 * 
 * Safe for preview/staging environments.
 */

export async function GET() {
	const status = getSupabaseStatus();
	
	return NextResponse.json({
		ok: status.configured,
		urlSet: status.urlSet,
		anonSet: status.anonKeySet,
		message: status.configured 
			? "Supabase is configured" 
			: "Supabase environment variables are not set",
		note: "Only using ANON key (not service role)",
	});
}
