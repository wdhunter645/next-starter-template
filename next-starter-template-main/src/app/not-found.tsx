import Link from "next/link";

export default function NotFound() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8 text-center">
				<h1 className="text-6xl font-bold" style={{ color: 'var(--lgfc-blue)' }}>404</h1>
				<h2 className="text-2xl font-semibold">Page Not Found</h2>
				<p className="text-lg" style={{ color: 'var(--lgfc-charcoal)' }}>
					Sorry, we couldn&apos;t find the page you&apos;re looking for.
				</p>
				<Link 
					href="/" 
					className="inline-block mt-4 px-6 py-3 font-medium rounded hover:opacity-90 transition-opacity"
					style={{ 
						backgroundColor: 'var(--lgfc-blue)', 
						color: 'white',
					}}
				>
					Return Home
				</Link>
			</div>
		</main>
	);
}
