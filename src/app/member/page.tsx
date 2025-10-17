/**
 * Member Dashboard
 * 
 * This page requires an authenticated session.
 * In a production app, this would:
 * 1. Check for valid session/JWT from Supabase or OAuth provider
 * 2. Redirect to login if not authenticated
 * 3. Display user-specific content and actions
 * 
 * TODO: Integrate with authentication system (Supabase Auth, GitHub OAuth, etc.)
 * For now, this is a placeholder that shows what a member-only page would contain.
 */

import Link from 'next/link';

export default function Member() {
	// TODO: Replace with actual auth check
	// const session = await getServerSession();
	// if (!session) {
	//   redirect('/auth/login');
	// }
	
	// Placeholder user data (would come from session in production)
	const userEmail = 'member@example.com';
	
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Member Dashboard</h1>
					<p className="text-lg text-foreground/80 mb-8">
						Welcome to the Lou Gehrig Fan Club member area.
					</p>
				</div>

				<div className="bg-muted/50 p-6 rounded-lg">
					<h2 className="text-2xl font-semibold mb-4">Your Account</h2>
					<div className="space-y-3">
						<div>
							<span className="font-semibold">Email:</span>{' '}
							<span className="text-foreground/80">{userEmail}</span>
						</div>
						<div>
							<span className="font-semibold">Membership Status:</span>{' '}
							<span className="text-green-600 dark:text-green-400">Active</span>
						</div>
					</div>
				</div>

				<div className="bg-muted/50 p-6 rounded-lg">
					<h2 className="text-2xl font-semibold mb-4">Member Features</h2>
					<ul className="list-disc list-inside space-y-2 text-foreground/80">
						<li>Access to exclusive content and archives</li>
						<li>Member-only events and discussions</li>
						<li>Early access to announcements</li>
						<li>Support the Lou Gehrig legacy</li>
					</ul>
				</div>

				<div className="pt-6 space-x-4 text-center">
					<Link 
						href="/"
						className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
					>
						Return to Home
					</Link>
					<button
						className="inline-block px-6 py-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
					>
						Sign Out
					</button>
				</div>

				<div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
					<p className="text-sm text-foreground/70">
						<strong>Note:</strong> This page requires authentication. 
						Authentication is currently a placeholder and needs to be integrated 
						with Supabase Auth or another provider.
					</p>
				</div>
			</div>
		</div>
	);
}
