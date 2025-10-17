import { NextResponse } from 'next/server';

/**
 * Supabase Status Endpoint
 * 
 * Returns the configuration status of Supabase environment variables
 * without exposing any secrets or attempting to connect to the database.
 * 
 * This is a smoke test to verify environment variables are set correctly
 * without causing runtime failures if Supabase is not configured.
 */
export async function GET() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	return NextResponse.json({
		ok: true,
		urlSet: !!supabaseUrl,
		anonSet: !!supabaseAnonKey,
	});
}
