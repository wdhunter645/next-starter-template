import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Charities | Lou Gehrig Fan Club",
	description: "Learn about charitable organizations honoring Lou Gehrig's legacy and supporting ALS research and awareness.",
};

export default function Charities() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Charities</h1>
					<p className="text-lg text-foreground/80">
						Learn about charitable organizations honoring Lou Gehrig&apos;s legacy.
					</p>
					{/* TODO: Add charities data hooks and display cards */}
				</div>
			</div>
		</div>
	);
}
