import Hero from "@/components/Home/Hero";
import Sections from "@/components/Home/Sections";

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
			<Sections />
		</>
	);
}
