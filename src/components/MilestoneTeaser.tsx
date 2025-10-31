import Link from "next/link";
import styles from "./MilestoneTeaser.module.css";

interface Milestone {
	year: string;
	title: string;
}

const milestones: Milestone[] = [
	{ year: "1925", title: "Major League Debut" },
	{ year: "1927", title: "First World Series Championship" },
	{ year: "1939", title: "Farewell Speech at Yankee Stadium" },
];

export default function MilestoneTeaser() {
	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<h2 className={styles.heading}>Milestones in Gehrig&apos;s Career</h2>
				<div className={styles.cards}>
					{milestones.map((milestone) => (
						<div key={milestone.year} className={styles.card}>
							<div className={styles.year}>{milestone.year}</div>
							<div className={styles.title}>{milestone.title}</div>
						</div>
					))}
				</div>
				<div className={styles.buttonContainer}>
					<Link href="/milestones" className={styles.button}>
						View All Milestones
					</Link>
				</div>
			</div>
		</section>
	);
}
