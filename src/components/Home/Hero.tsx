import Link from "next/link";
import { siteConfig } from "@/lib/site/config";
import styles from "./Hero.module.css";

export default function Hero() {
	return (
		<div className={styles.hero}>
			<div className={styles.container}>
				<h1 className={styles.title}>{siteConfig.siteName}</h1>
				<p className={styles.subtitle}>LGFC live via Cloudflare</p>
				<p className={styles.mission}>
					{siteConfig.siteDescription}
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
