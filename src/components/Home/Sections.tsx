import Link from "next/link";
import styles from "./Sections.module.css";

export default function Sections() {
	return (
		<div className={styles.sections}>
			{/* Weekly Teaser */}
			<section className={styles.section}>
				<div className={styles.container}>
					<h2 className={styles.sectionTitle}>Weekly Matchup</h2>
					<p className={styles.sectionDescription}>
						Stay up to date with weekly baseball highlights and analysis honoring Lou Gehrig&apos;s incredible record.
					</p>
					<Link href="/weekly" className={styles.sectionLink}>
						View Weekly →
					</Link>
				</div>
			</section>
			
			{/* Milestones Teaser */}
			<section className={styles.section}>
				<div className={styles.container}>
					<h2 className={styles.sectionTitle}>Milestones</h2>
					<p className={styles.sectionDescription}>
						Explore the remarkable career achievements and records of baseball&apos;s Iron Horse.
					</p>
					<Link href="/milestones" className={styles.sectionLink}>
						Explore Milestones →
					</Link>
				</div>
			</section>
			
			{/* News Teaser */}
			<section className={styles.section}>
				<div className={styles.container}>
					<h2 className={styles.sectionTitle}>News &amp; Q&amp;A</h2>
					<p className={styles.sectionDescription}>
						Join the conversation and stay informed with the latest news and community discussions.
					</p>
					<Link href="/news" className={styles.sectionLink}>
						Read News →
					</Link>
				</div>
			</section>
		</div>
	);
}
