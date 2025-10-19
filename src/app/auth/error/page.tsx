import Link from 'next/link';

export const runtime = 'edge';

export default async function AuthError({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; description?: string }>;
}) {
	const params = await searchParams;
	const error = params.error || 'unknown_error';
	const description = params.description || 'An unknown error occurred during authorization.';

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-2xl w-full text-center space-y-6">
				<div className="text-6xl mb-4">❌</div>
				<h1 className="text-4xl font-bold mb-4">Authorization Failed</h1>
				<p className="text-lg text-foreground/80 mb-8">
					There was a problem during the OAuth authorization process.
				</p>
				<div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg text-left">
					<h2 className="text-xl font-semibold mb-3 text-red-600 dark:text-red-400">Error Details</h2>
					<div className="space-y-2">
						<div>
							<span className="font-semibold">Error Code:</span>{' '}
							<code className="bg-muted px-2 py-1 rounded text-sm">{error}</code>
						</div>
						<div>
							<span className="font-semibold">Description:</span>{' '}
							<span className="text-foreground/80">{description}</span>
						</div>
					</div>
				</div>
				<div className="bg-muted/50 p-6 rounded-lg text-left">
					<h2 className="text-xl font-semibold mb-3">Common Issues</h2>
					<ul className="list-disc list-inside space-y-2 text-foreground/80">
						<li><strong>access_denied:</strong> You declined to authorize the app</li>
						<li><strong>redirect_uri_mismatch:</strong> Configuration error with callback URL</li>
						<li><strong>invalid_client:</strong> App credentials are incorrect</li>
						<li><strong>temporarily_unavailable:</strong> Try again in a few moments</li>
					</ul>
				</div>
				<div className="pt-6 space-x-4">
					<Link 
						href="/"
						className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
					>
						Return to Home
					</Link>
					<a 
						href="/auth/retry"
						className="inline-block px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
					>
						Try Again
					</a>
				</div>
			</div>
		</div>
	);
}
