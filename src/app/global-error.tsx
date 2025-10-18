"use client";

/**
 * Global Error Boundary
 * 
 * This catches errors in the root layout.
 * It must render its own <html> and <body> tags.
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
			<body style={{ 
				margin: 0, 
				fontFamily: "var(--font-sans)", 
				background: "var(--color-bg)", 
				color: "var(--color-fg)" 
			}}>
				<div style={{ 
					minHeight: "100vh", 
					display: "flex", 
					alignItems: "center", 
					justifyContent: "center", 
					padding: "2rem" 
				}}>
					<div style={{ maxWidth: "42rem", textAlign: "center" }}>
						<h1 style={{ fontSize: "3rem", fontWeight: "700", marginBottom: "1rem" }}>
							500
						</h1>
						<h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
							Server Error
						</h2>
						<p style={{ fontSize: "1.125rem", marginBottom: "2rem", opacity: 0.8 }}>
							Something went wrong on our end. Please try again later.
						</p>
						{error.digest && (
							<p style={{ fontSize: "0.875rem", opacity: 0.6, marginBottom: "2rem" }}>
								Error ID: {error.digest}
							</p>
						)}
						<button
							onClick={reset}
							style={{
								display: "inline-block",
								padding: "0.75rem 2rem",
								fontSize: "1rem",
								fontWeight: "600",
								background: "var(--color-accent)",
								color: "var(--color-bg)",
								border: "none",
								borderRadius: "0.5rem",
								cursor: "pointer",
							}}
							onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
							onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
						>
							Try Again
						</button>
					</div>
				</div>
			</body>
		</html>
	);
}
