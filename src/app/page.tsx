'use client';

import styles from "./page.module.css";
import WeeklyMatchup from "@/components/WeeklyMatchup";
import SocialWall from "@/components/SocialWall";
import FAQSection from "@/components/FAQSection";
import MilestonesSection from "@/components/MilestonesSection";

export default function Home() {
	return (
		<>
			<style jsx>{`
				.section-gap {
					margin-block: var(--section-gap);
				}
			`}</style>
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
			<section id="join" className="section-gap">
				<div className="joinBanner">
					<div className="join-banner__container">
						<p className="join-banner__text">
							Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more.
						</p>
						<div className="join-banner__actions">
							<a className="join-banner__btn" href="/join">Join</a>
							<a className="join-banner__btn" href="/member">Login</a>
						</div>
					</div>
				</div>
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
