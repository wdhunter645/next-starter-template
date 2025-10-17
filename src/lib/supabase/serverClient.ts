/**
 * Supabase Server Client
 * 
 * Server-side Supabase instance for use in API routes and Server Components.
 * Uses environment variables (not NEXT_PUBLIC_*).
 * 
 * IMPORTANT: Uses ANON key only, NOT service role key.
 * This maintains security while allowing server-side queries.
 * 
 * TODO: Install @supabase/supabase-js package:
 *   npm install @supabase/supabase-js
 * 
 * Then uncomment the createClient import and usage below.
 * 
 * Usage (after package installed):
 *   import { getSupabaseServer } from '@/lib/supabase/serverClient';
 *   const supabase = getSupabaseServer();
 *   const { data } = await supabase.from('table').select();
 */

// TODO: Uncomment when @supabase/supabase-js is installed
// import { createClient } from '@supabase/supabase-js';

// Get environment variables (server-side only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY || '';

// Check if Supabase is configured
const isConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Get server-side Supabase client
 * Creates a new client instance each time (suitable for API routes)
 */
export function getSupabaseServer() {
	if (!isConfigured) {
		return null;
	}
	
	// TODO: Uncomment when @supabase/supabase-js is installed
	// return createClient(supabaseUrl, supabaseAnonKey);
	
	// Placeholder until package is installed
	return null;
}

/**
 * Check if Supabase is configured for server use
 */
export function isSupabaseConfigured(): boolean {
	return isConfigured;
}

/**
 * Get Supabase configuration status
 * Safe to expose - only shows presence, not values
 */
export function getSupabaseStatus() {
	return {
		configured: isConfigured,
		urlSet: !!supabaseUrl,
		anonKeySet: !!supabaseAnonKey,
	};
}
