import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Member Area - LGFC",
	description: "Access member-exclusive content and manage your Lou Gehrig Fan Club membership.",
};

export default function Member() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Join the Club</h1>
					<p className="text-lg text-foreground/80">
						Become a member of the Lou Gehrig Fan Club community.
					</p>
					{/* TODO: Add membership form and registration logic */}
				</div>
			</div>
		</div>
	);
}
