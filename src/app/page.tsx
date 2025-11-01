import styles from "./page.module.css";
import MilestoneTeaser from "@/components/MilestoneTeaser";
import WeeklyPreview from "@/components/WeeklyPreview";

export default function Home() {
	return (
		<>
			<div className={styles.hero}>
				<div className={styles.container}>
					<h1 className={styles.title}>Lou Gehrig Fan Club</h1>
					<p className={styles.subtitle}>
						Honoring the legacy of baseball&apos;s Iron Horse through community, education, and support for ALS research.
					</p>
				</div>
			</div>
			<WeeklyPreview />
			<MilestoneTeaser />
		</>
	);
}
