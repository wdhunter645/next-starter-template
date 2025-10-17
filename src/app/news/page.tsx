import type { Metadata } from "next";
import SocialWall from "@/components/SocialWall";

export const metadata: Metadata = {
	title: "News & Q&A | Lou Gehrig Fan Club",
	description: "Stay updated with the latest news and community discussions about Lou Gehrig and the fan club.",
};

export default function News() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">News &amp; Q&amp;A</h1>
					<p className="text-lg text-foreground/80">
						Stay updated with the latest news and community discussions.
					</p>
					{/* TODO: Add news feed and Q&A data hooks */}
				</div>
				<div className="mt-8">
					<SocialWall />
				</div>
			</div>
		</div>
	);
}
