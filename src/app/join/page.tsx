import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Join the Club - LGFC",
	description: "Become a member of the Lou Gehrig Fan Club and support ALS research.",
};

export default function Join() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Join the Club</h1>
					<p className="text-lg text-foreground/80 mb-8">
						Become a member of the Lou Gehrig Fan Club community and support ALS research.
					</p>
					<div className="space-y-4">
						<h2 className="text-2xl font-semibold">Membership Benefits</h2>
						<ul className="text-left max-w-2xl mx-auto space-y-2">
							<li>• Access to exclusive content and historical archives</li>
							<li>• Participate in weekly photo matchups and voting</li>
							<li>• Connect with fellow Lou Gehrig fans worldwide</li>
							<li>• Support ALS research and awareness initiatives</li>
							<li>• Receive updates on events and milestones</li>
						</ul>
					</div>
					{/* TODO: Add membership registration form */}
				</div>
			</div>
		</div>
	);
}
