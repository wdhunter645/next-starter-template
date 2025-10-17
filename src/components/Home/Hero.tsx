import Link from "next/link";
import styles from "./Hero.module.css";

/**
 * Hero Component
 * 
 * Main hero section for the home page using theme tokens.
 * CTA button links to /member page.
 * Uses existing theme variables from globals.css for consistency.
 */
export default function Hero() {
	return (
		<div className={styles.hero}>
			<div className={styles.container}>
				<h1 className={styles.title}>Lou Gehrig Fan Club</h1>
				<p className={styles.subtitle}>LGFC live via Cloudflare</p>
				<p className={styles.mission}>
					Honoring the legacy of baseball&apos;s Iron Horse through community, education, and support for ALS research and awareness.
				</p>
				<div className={styles.actions}>
					<Link href="/member" className={styles.primaryButton}>
						Join the Club
					</Link>
					<Link href="/milestones" className={styles.secondaryLink}>
						See Milestones
					</Link>
				</div>
			</div>
		</div>
	);
}
