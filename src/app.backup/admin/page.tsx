import { getSession } from "@/lib/auth/session";
import { isUserAdmin } from "@/lib/auth/adminGuard";

export default async function Admin() {
	// Require authentication
	const session = await getSession();
	
	if (!session.user) {
		// TODO: Redirect to login page once implemented
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-8">
				<div className="max-w-4xl w-full space-y-8">
					<div className="text-center">
						<h1 className="text-4xl font-bold mb-4">Authentication Required</h1>
						<p className="text-lg text-foreground/80">
							Please sign in to access the admin area.
						</p>
					</div>
				</div>
			</div>
		);
	}
	
	// Check if user is admin
	const isAdmin = isUserAdmin(session.user.email);
	
	if (!isAdmin) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-8">
				<div className="max-w-4xl w-full space-y-8">
					<div className="text-center">
						<h1 className="text-4xl font-bold mb-4">Access Denied</h1>
						<p className="text-lg text-foreground/80">
							You do not have permission to access the admin area.
						</p>
						<p className="text-sm text-foreground/60 mt-4">
							Admin access is restricted to authorized users only.
						</p>
					</div>
				</div>
			</div>
		);
	}
	
	// User is authenticated and is admin
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
					<p className="text-lg text-foreground/80 mb-4">
						Administrative dashboard for site management.
					</p>
					<div className="bg-foreground/5 p-6 rounded-lg">
						<p className="text-sm">
							<strong>Admin user:</strong> {session.user.email}
						</p>
						<p className="text-sm mt-4 text-foreground/60">
							TODO: Add admin dashboard components
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
