import Hero from "@/components/Home/Hero";
import SectionTeasers from "@/components/Home/SectionTeasers";

/**
 * Home Page
 * 
 * Main landing page featuring:
 * - Hero section with CTA to /member
 * - Section teasers for Weekly, Milestones, and News
 */
export default function Home() {
	return (
		<>
			<Hero />
			<SectionTeasers />
		</>
	);
}
