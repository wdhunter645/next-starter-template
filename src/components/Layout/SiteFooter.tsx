import Link from "next/link";
import { siteConfig } from "@/lib/site/config";
import styles from "./SiteFooter.module.css";
import packageJson from "../../../package.json";

// Environment variables with safe fallbacks
const commitSha = process.env.CF_PAGES_COMMIT_SHA || "";
const shortSha = commitSha ? commitSha.substring(0, 7) : null;
const version = packageJson.version || "1.0.0";

export default function SiteFooter() {
	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={styles.copyright}>
						<p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
					</div>
					<div className={styles.links}>
						{siteConfig.footer.legal.map((link) => (
							<Link 
								key={link.path}
								href={link.path} 
								className={styles.link}
							>
								{link.label}
							</Link>
						))}
						{siteConfig.footer.admin.map((link) => (
							<Link 
								key={link.path}
								href={link.path} 
								className={styles.link}
							>
								{link.label}
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
