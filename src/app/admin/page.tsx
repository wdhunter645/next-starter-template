/**
 * Admin Dashboard
 * 
 * This page requires an authenticated admin session.
 * Access is controlled by checking:
 * 1. Valid session/authentication
 * 2. User email is in ADMIN_EMAILS environment variable
 * 
 * In a production app, this would:
 * 1. Verify session token from Supabase or OAuth provider
 * 2. Extract user email from verified session
 * 3. Check if email is in admin list
 * 4. Redirect to login or show 403 if not authorized
 * 
 * TODO: Integrate with authentication system
 * For now, this is a placeholder showing admin tools and links.
 */

import Link from 'next/link';

export default function Admin() {
	// TODO: Replace with actual auth check
	// const session = await getServerSession();
	// if (!session) {
	//   redirect('/auth/login');
	// }
	// const adminCheck = await checkAdminAccess(session.user.email);
	// if (!adminCheck.authorized) {
	//   return <div>403 Forbidden</div>;
	// }
	
	// Placeholder admin email (would come from session in production)
	const adminEmail = 'admin@example.com';
	
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
					<p className="text-lg text-foreground/80 mb-8">
						Administrative tools and site management.
					</p>
				</div>

				<div className="bg-muted/50 p-6 rounded-lg">
					<h2 className="text-2xl font-semibold mb-4">Your Admin Account</h2>
					<div className="space-y-3">
						<div>
							<span className="font-semibold">Email:</span>{' '}
							<span className="text-foreground/80">{adminEmail}</span>
						</div>
						<div>
							<span className="font-semibold">Role:</span>{' '}
							<span className="text-blue-600 dark:text-blue-400">Administrator</span>
						</div>
					</div>
				</div>

				<div className="bg-muted/50 p-6 rounded-lg">
					<h2 className="text-2xl font-semibold mb-4">Admin Tools</h2>
					<div className="space-y-4">
						<div className="border-l-4 border-blue-500 pl-4 py-2">
							<h3 className="font-semibold text-lg mb-2">Backblaze B2 Storage</h3>
							<p className="text-sm text-foreground/70 mb-3">
								Manage file uploads and storage with S3-compatible API
							</p>
							<div className="space-y-2">
								<div>
									<a 
										href="/api/admin/b2/presign"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
									>
										📤 POST /api/admin/b2/presign
									</a>
									<span className="text-xs text-foreground/60 ml-2">
										- Generate presigned upload URLs
									</span>
								</div>
								<div>
									<a 
										href="/api/admin/b2/sync"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
									>
										🔄 GET /api/admin/b2/sync
									</a>
									<span className="text-xs text-foreground/60 ml-2">
										- Sync/list bucket contents (stub)
									</span>
								</div>
							</div>
						</div>

						<div className="border-l-4 border-green-500 pl-4 py-2">
							<h3 className="font-semibold text-lg mb-2">Supabase Integration</h3>
							<p className="text-sm text-foreground/70 mb-3">
								Database and authentication status
							</p>
							<div>
								<a 
									href="/api/supabase/status"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
								>
									✓ GET /api/supabase/status
								</a>
								<span className="text-xs text-foreground/60 ml-2">
									- Check Supabase configuration
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-muted/50 p-6 rounded-lg">
					<h2 className="text-2xl font-semibold mb-4">Security Notes</h2>
					<ul className="list-disc list-inside space-y-2 text-sm text-foreground/80">
						<li>All admin endpoints require authentication and admin email verification</li>
						<li>B2 endpoints return 503 if storage is not configured (graceful degradation)</li>
						<li>No secrets are exposed in API responses</li>
						<li>Admin emails are configured via ADMIN_EMAILS environment variable</li>
					</ul>
				</div>

				<div className="pt-6 space-x-4 text-center">
					<Link 
						href="/"
						className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
					>
						Return to Home
					</Link>
					<Link
						href="/member"
						className="inline-block px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
					>
						Member Area
					</Link>
				</div>

				<div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
					<p className="text-sm text-foreground/70">
						<strong>Note:</strong> This page requires admin authentication. 
						Authentication guards are currently placeholders and need to be integrated 
						with your chosen auth provider (Supabase, GitHub OAuth, etc.).
					</p>
				</div>
			</div>
		</div>
	);
}
