import styles from "./page.module.css";
import WeeklyMatchup from "@/components/WeeklyMatchup";
import SocialWall from "@/components/SocialWall";
import FAQSection from "@/components/FAQSection";
import MilestonesSection from "@/components/MilestonesSection";
import JoinCTA from "@/components/JoinCTA";

export default function Home() {
	return (
		<>
			{/* Section: Hero Banner */}
			<header id="banner" className={styles.hero}>
				<div className={styles.container}>
					<h1 className={styles.title}>Lou Gehrig Fan Club</h1>
					<p className={styles.subtitle}>
						We are proud to be fans of the greatest baseball player ever and are dedicated to celebrating his life and legacy.
					</p>
				</div>
			</header>
			{/* Section: Weekly Photo Matchup */}
			<section id="weekly" className="section-gap">
				<WeeklyMatchup />
			</section>
			{/* Section: Join Banner */}
			<section id="join">
				<JoinCTA />
			</section>
			{/* Section: Social Wall */}
			<section id="social" className="section-gap">
				<SocialWall />
			</section>
			{/* Section: FAQ and Milestones */}
			<section id="faq-milestones" className="section-gap">
				<div className="container two-col" role="region" aria-label="FAQ and Milestones">
					<div className="section--tight">
						<FAQSection />
					</div>
					<div className="section--tight">
						<MilestonesSection />
					</div>
				</div>
			</section>
		</>
	);
}
