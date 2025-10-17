"use client";

import Link from "next/link";

/**
 * Global Error Page (500)
 * 
 * This page is displayed when an unhandled error occurs in the application.
 * It must be a Client Component in Next.js App Router.
 * 
 * Note: This is rendered in place of the root layout in case of errors in layout.tsx
 */
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body>
				<div className="min-h-screen flex flex-col items-center justify-center p-8">
					<div className="max-w-4xl w-full space-y-8 text-center">
						<h1 className="text-6xl font-bold">500</h1>
						<h2 className="text-2xl font-semibold">Something went wrong</h2>
						<p className="text-lg opacity-80">
							We encountered an unexpected error. Please try again.
						</p>
						{process.env.NODE_ENV === "development" && error.message && (
							<pre className="mt-4 p-4 bg-red-900/10 border border-red-500/20 rounded text-left text-sm overflow-x-auto">
								{error.message}
							</pre>
						)}
						<div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
							<button
								onClick={reset}
								className="inline-block px-6 py-3 bg-foreground text-background font-medium rounded hover:opacity-90 transition-opacity"
							>
								Try Again
							</button>
							<Link
								href="/"
								className="inline-block px-6 py-3 border border-current font-medium rounded hover:opacity-80 transition-opacity"
							>
								Return Home
							</Link>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
