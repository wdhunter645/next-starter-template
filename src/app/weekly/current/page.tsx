import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Current Voting - LGFC",
	description: "View current weekly photo matchup voting results.",
};

export default function CurrentVoting() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Current Voting</h1>
					<p className="text-lg text-foreground/80">
						View the current weekly photo matchup voting results here.
					</p>
					{/* TODO: Add voting results display logic */}
				</div>
			</div>
		</div>
	);
}
