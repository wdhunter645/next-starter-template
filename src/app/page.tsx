import styles from "./page.module.css";
import WeeklyMatchup from "@/components/WeeklyMatchup";
import SocialWall from "@/components/SocialWall";

export default function Home() {
	return (
		<>
			{/* Section: Hero Banner */}
			<div className={styles.hero}>
				<div className={styles.container}>
					<h1 className={styles.title}>Lou Gehrig Fan Club</h1>
					<p className={styles.subtitle}>
						We are proud to be fans of the greatest baseball player ever and are dedicated to celebrating his life and legacy.
					</p>
				</div>
			</div>
			{/* Section: Weekly Photo Matchup */}
			<WeeklyMatchup />
			{/* Section: Social Wall */}
			<SocialWall />
		</>
	);
}
