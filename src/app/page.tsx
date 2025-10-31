import Link from "next/link";
import styles from "./page.module.css";
import NewsTeaser from "@/components/NewsTeaser";

export default function Home() {
	return (
		<>
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
					</div>
				</div>
			</div>
			<NewsTeaser />
		</>
	);
}
