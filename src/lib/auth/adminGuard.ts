/**
 * Admin Guard - Server-side helper for admin authorization
 * 
 * Checks if a user's email is in the ADMIN_EMAILS environment variable.
 * This is a server-side only utility - never expose on client.
 * 
 * Usage:
 *   const isAdmin = isUserAdmin(userEmail);
 *   if (!isAdmin) return { redirect: { destination: '/', permanent: false } };
 */

/**
 * Check if an email is in the admin list
 * @param email - User email to check
 * @returns true if user is admin, false otherwise
 */
export function isUserAdmin(email: string | null | undefined): boolean {
	if (!email) return false;
	
	const adminEmails = process.env.ADMIN_EMAILS || "";
	const adminList = adminEmails
		.split(",")
		.map(e => e.trim().toLowerCase())
		.filter(e => e.length > 0);
	
	return adminList.includes(email.toLowerCase());
}

/**
 * Get the list of admin emails from environment
 * @returns Array of admin email addresses
 */
export function getAdminEmails(): string[] {
	const adminEmails = process.env.ADMIN_EMAILS || "";
	return adminEmails
		.split(",")
		.map(e => e.trim())
		.filter(e => e.length > 0);
}

/**
 * Check if admin emails are configured
 * @returns true if ADMIN_EMAILS env var is set and non-empty
 */
export function hasAdminConfig(): boolean {
	const adminEmails = process.env.ADMIN_EMAILS || "";
	return adminEmails.trim().length > 0;
}
