import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy | Lou Gehrig Fan Club",
	description: "Privacy policy for the Lou Gehrig Fan Club website.",
};

export default function Privacy() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
					<p className="text-lg text-foreground/80">
						Your privacy is important to us.
					</p>
					{/* TODO: Add privacy policy content */}
				</div>
			</div>
		</div>
	);
}
