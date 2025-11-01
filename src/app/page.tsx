import Link from "next/link";
import styles from "./page.module.css";
import CharitySpotlight from "@/components/CharitySpotlight";
import MilestoneTeaser from "@/components/MilestoneTeaser";

export default function Home() {
	return (
		<>
			<div className={styles.hero}>
				<div className={styles.container}>
					<h1 className={styles.title}>Lou Gehrig Fan Club</h1>
					<p className={styles.subtitle}>
						Honoring the legacy of baseball&apos;s Iron Horse through community, education, and support for ALS research.
					</p>
					<div className={styles.actions}>
						<Link href="/member" className={styles.primaryButton}>
							Join the Club
						</Link>
					</div>
				</div>
			</div>
			<CharitySpotlight />
			<MilestoneTeaser />
		</>
	);
}
