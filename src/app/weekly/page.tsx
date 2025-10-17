import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Weekly Matchup | Lou Gehrig Fan Club",
	description: "Check out the weekly matchup highlights and analysis from the Lou Gehrig Fan Club community.",
};

export default function Weekly() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Weekly Matchup</h1>
					<p className="text-lg text-foreground/80">
						Check back soon for weekly matchup highlights and analysis.
					</p>
					{/* TODO: Add weekly matchup data hooks and display logic */}
				</div>
			</div>
		</div>
	);
}
