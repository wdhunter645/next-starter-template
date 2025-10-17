import { getSession } from "@/lib/auth/session";

export default async function Member() {
	// Require authentication
	const session = await getSession();
	
	if (!session.user) {
		// TODO: Redirect to login page once implemented
		// For now, show message that authentication is required
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-8">
				<div className="max-w-4xl w-full space-y-8">
					<div className="text-center">
						<h1 className="text-4xl font-bold mb-4">Authentication Required</h1>
						<p className="text-lg text-foreground/80">
							Please sign in to access the members area.
						</p>
						<p className="text-sm text-foreground/60 mt-4">
							TODO: Implement authentication system
						</p>
					</div>
				</div>
			</div>
		);
	}
	
	// User is authenticated
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Member Area</h1>
					<p className="text-lg text-foreground/80 mb-4">
						Welcome to the Lou Gehrig Fan Club members area.
					</p>
					<div className="bg-foreground/5 p-6 rounded-lg">
						<p className="text-sm">
							<strong>Signed in as:</strong> {session.user.email}
						</p>
						<p className="text-sm mt-2 text-foreground/60">
							TODO: Add sign out functionality
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
