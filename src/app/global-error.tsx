'use client';

/**
 * Global error boundary - catches errors at the root level
 * Temporary diagnostic component to surface runtime errors
 */
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html>
			<body>
				<div style={{ padding: '2rem', fontFamily: 'monospace' }}>
					<h1 style={{ color: 'red' }}>Global Error</h1>
					<h2>Error Details:</h2>
					<pre style={{ 
						background: '#f4f4f4', 
						padding: '1rem', 
						overflow: 'auto',
						border: '1px solid #ddd'
					}}>
						{error.message}
					</pre>
					<h3>Stack Trace:</h3>
					<pre style={{ 
						background: '#f4f4f4', 
						padding: '1rem', 
						overflow: 'auto',
						fontSize: '0.8rem',
						border: '1px solid #ddd'
					}}>
						{error.stack}
					</pre>
					{error.digest && (
						<p>
							<strong>Error Digest:</strong> {error.digest}
						</p>
					)}
					<button
						onClick={reset}
						style={{
							marginTop: '1rem',
							padding: '0.5rem 1rem',
							background: '#0070f3',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Try Again
					</button>
				</div>
			</body>
		</html>
	);
}
