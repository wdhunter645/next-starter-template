"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Error Boundary Component
 * 
 * This file creates an error boundary for the application.
 * It catches React errors and displays a user-friendly error page.
 * 
 * Note: This is a special Next.js file that must be a Client Component.
 */

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log error to console (in production, could send to error tracking service)
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8 text-center">
				<h1 className="text-6xl font-bold">Error</h1>
				<h2 className="text-2xl font-semibold">Something went wrong</h2>
				<p className="text-lg" style={{ color: "var(--color-muted)" }}>
					We encountered an unexpected error. Please try again.
				</p>
				{error.digest && (
					<p className="text-sm" style={{ color: "var(--color-muted)" }}>
						Error ID: {error.digest}
					</p>
				)}
				<div className="flex gap-4 justify-center mt-4">
					<button
						onClick={reset}
						className="inline-block px-6 py-3 font-medium rounded transition-opacity"
						style={{
							background: "var(--color-accent)",
							color: "var(--color-bg)",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
						onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
					>
						Try Again
					</button>
					<Link
						href="/"
						className="inline-block px-6 py-3 font-medium rounded transition-opacity"
						style={{
							background: "var(--color-fg)",
							color: "var(--color-bg)",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
						onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
					>
						Return Home
					</Link>
				</div>
			</div>
		</div>
	);
}
