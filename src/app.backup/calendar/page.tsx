export default function Calendar() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Calendar</h1>
					<p className="text-lg text-foreground/80">
						View upcoming events and important dates for the fan club.
					</p>
					{/* TODO: Add calendar data hooks and event display */}
				</div>
			</div>
		</div>
	);
}
