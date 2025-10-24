export default function Admin() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Admin</h1>
					<p className="text-lg text-foreground/80">
						Administrative dashboard for site management.
					</p>
					{/* TODO: Add admin authentication and dashboard components */}
				</div>
			</div>
		</div>
	);
}
