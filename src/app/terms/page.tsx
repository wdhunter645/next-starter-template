import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Terms of Service | Lou Gehrig Fan Club",
	description: "Terms of service for the Lou Gehrig Fan Club website.",
};

export default function Terms() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
					<p className="text-lg text-foreground/80">
						Please read these terms carefully.
					</p>
					{/* TODO: Add terms of service content */}
				</div>
			</div>
		</div>
	);
}
