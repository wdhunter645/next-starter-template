import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for use in server components and API routes
 * Uses the anon key by default for read-only patterns that respect RLS
 * 
 * Note: SUPABASE_SERVICE_ROLE_KEY is intentionally NOT used here.
 * If you need service role access (which bypasses RLS), you must:
 * 1. Ensure the code is server-only (never sent to client)
 * 2. Verify admin session/permissions before any operation
 * 3. Explicitly check for and use the service role key in that specific context
 */
export function createServerClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
		);
	}

	return createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});
}
