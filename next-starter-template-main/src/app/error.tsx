'use client';

import { useEffect } from 'react';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error('Error caught by error boundary:', error);
	}, [error]);

	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8 text-center">
				<h1 className="text-6xl font-bold" style={{ color: 'var(--lgfc-red)' }}>500</h1>
				<h2 className="text-2xl font-semibold">Something went wrong!</h2>
				<p className="text-lg" style={{ color: 'var(--lgfc-charcoal)' }}>
					We&apos;re sorry, but something unexpected happened. Please try again.
				</p>
				<button
					onClick={reset}
					className="inline-block mt-4 px-6 py-3 font-medium rounded hover:opacity-90 transition-opacity"
					style={{ 
						backgroundColor: 'var(--lgfc-blue)', 
						color: 'white',
					}}
				>
					Try again
				</button>
			</div>
		</main>
	);
}
