import Link from 'next/link';

export default function AuthSuccess() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-2xl w-full text-center space-y-6">
				<div className="text-6xl mb-4">✅</div>
				<h1 className="text-4xl font-bold mb-4">Authorization Successful!</h1>
				<p className="text-lg text-foreground/80 mb-8">
					You have successfully authorized the GitHub App with OAuth.
					The app now has the requested permissions to access your account.
				</p>
				<div className="bg-muted/50 p-6 rounded-lg text-left">
					<h2 className="text-xl font-semibold mb-3">What happens now?</h2>
					<ul className="list-disc list-inside space-y-2 text-foreground/80">
						<li>The app will appear in your OAuth authorized applications</li>
						<li>You can manage permissions at any time in your GitHub settings</li>
						<li>The app can now act on your behalf within the granted permissions</li>
					</ul>
				</div>
				<div className="pt-6">
					<Link 
						href="/"
						className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
					>
						Return to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
