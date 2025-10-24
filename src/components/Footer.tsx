import Link from "next/link";
import styles from "./Footer.module.css";
import packageJson from "../../package.json";

// Environment variables with safe fallbacks
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Lou Gehrig Fan Club";
const commitSha = process.env.CF_PAGES_COMMIT_SHA;
const shortSha = commitSha ? commitSha.substring(0, 7) : null;
const version = packageJson.version || "1.0.0";

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={styles.copyright}>
						<p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
					</div>
					<div className={styles.links}>
						<Link href="/privacy" className={styles.link}>
							Privacy
						</Link>
						<Link href="/terms" className={styles.link}>
							Terms
						</Link>
						<Link href="/admin" className={styles.link}>
							Admin
						</Link>
					</div>
				</div>
				<div className={styles.buildInfo}>
					<p>
						v{version}
						{shortSha && ` • ${shortSha}`}
					</p>
				</div>
			</div>
		</footer>
	);
}
