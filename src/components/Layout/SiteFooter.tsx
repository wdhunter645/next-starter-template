import Link from "next/link";
import { siteConfig } from "@/lib/site/config";
import styles from "../Footer.module.css";
import packageJson from "../../../package.json";

/**
 * SiteFooter Component
 * 
 * Main site footer with links and build info, reading from centralized site config.
 * Uses existing Footer.module.css for styling to maintain consistency.
 */

// Environment variables with safe fallbacks
const commitSha = process.env.CF_PAGES_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "";
const shortSha = commitSha ? commitSha.substring(0, 7) : null;
const version = packageJson.version || "1.0.0";

export default function SiteFooter() {
	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={styles.copyright}>
						<p>&copy; {new Date().getFullYear()} {siteConfig.siteName}. All rights reserved.</p>
					</div>
					<div className={styles.links}>
						{siteConfig.navigation.footer.map((item) => (
							<Link 
								key={item.path}
								href={item.path} 
								className={styles.link}
							>
								{item.label}
							</Link>
						))}
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
