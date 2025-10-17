import Link from "next/link";
import { siteConfig } from "@/lib/site/config";
import styles from "../Header.module.css";

/**
 * SiteHeader Component
 * 
 * Main site header with navigation, reading from centralized site config.
 * Uses existing Header.module.css for styling to maintain consistency.
 */
export default function SiteHeader() {
	return (
		<header className={styles.header}>
			<nav className={styles.nav} aria-label="Main navigation">
				<div className={styles.navContent}>
					<Link 
						href="/" 
						className={styles.logo}
						aria-label={`${siteConfig.siteName} Home`}
					>
						LGFC
					</Link>
					<div className={styles.navLinks}>
						{siteConfig.navigation.main.map((item) => (
							<Link 
								key={item.path}
								href={item.path} 
								className={styles.navLink}
							>
								{item.label}
							</Link>
						))}
						<Link href="/member" className={styles.navLink}>
							Join
						</Link>
					</div>
				</div>
			</nav>
		</header>
	);
}
