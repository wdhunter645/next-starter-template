import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8 text-center">
				<h1 className="text-6xl font-bold">404</h1>
				<h2 className="text-2xl font-semibold">Page Not Found</h2>
				<p className="text-lg text-foreground/80">
					Sorry, we couldn&apos;t find the page you&apos;re looking for.
				</p>
				<Link 
					href="/" 
					className="inline-block mt-4 px-6 py-3 bg-foreground text-background font-medium rounded hover:opacity-90 transition-opacity"
				>
					Return Home
				</Link>
			</div>
		</div>
	);
}
