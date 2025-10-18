import Link from "next/link";
import styles from "./SectionTeasers.module.css";

/**
 * Section Teasers Component
 * 
 * Displays teaser cards for Weekly, Milestones, and News sections.
 * Encourages visitors to explore different parts of the site.
 */
export default function SectionTeasers() {
	return (
		<section className={styles.teasers}>
			<div className={styles.container}>
				<h2 className={styles.sectionTitle}>Explore More</h2>
				<div className={styles.grid}>
					<Link href="/weekly" className={styles.card}>
						<h3 className={styles.cardTitle}>Weekly Matchup</h3>
						<p className={styles.cardDescription}>
							Check back for weekly matchup highlights and analysis.
						</p>
						<span className={styles.cardLink}>View Weekly →</span>
					</Link>

					<Link href="/milestones" className={styles.card}>
						<h3 className={styles.cardTitle}>Milestones</h3>
						<p className={styles.cardDescription}>
							Explore the career milestones and achievements of Lou Gehrig.
						</p>
						<span className={styles.cardLink}>View Milestones →</span>
					</Link>

					<Link href="/news" className={styles.card}>
						<h3 className={styles.cardTitle}>News &amp; Q&amp;A</h3>
						<p className={styles.cardDescription}>
							Stay updated with the latest news and community discussions.
						</p>
						<span className={styles.cardLink}>View News →</span>
					</Link>
				</div>
			</div>
		</section>
	);
}
