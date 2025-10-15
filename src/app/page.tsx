export default function Home() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Welcome to LGFC</h1>
					<p className="text-lg text-foreground/80">
						Your trusted partner for exceptional services
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
					<div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
						<h2 className="text-xl font-semibold mb-2">Quality Service</h2>
						<p className="text-sm text-foreground/70">
							We deliver excellence in everything we do
						</p>
					</div>
					<div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
						<h2 className="text-xl font-semibold mb-2">Expert Team</h2>
						<p className="text-sm text-foreground/70">
							Our professionals are here to help you succeed
						</p>
					</div>
					<div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
						<h2 className="text-xl font-semibold mb-2">Customer Focus</h2>
						<p className="text-sm text-foreground/70">
							Your satisfaction is our top priority
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
