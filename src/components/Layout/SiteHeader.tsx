import Link from "next/link";
import { siteConfig } from "@/lib/site/config";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
	return (
		<header className={styles.header}>
			<nav className={styles.nav} aria-label="Main navigation">
				<div className={styles.navContent}>
					<Link 
						href="/" 
						className={styles.logo}
						aria-label={`${siteConfig.name} Home`}
					>
						{siteConfig.shortName}
					</Link>
					<div className={styles.navLinks}>
						{siteConfig.nav.map((link) => (
							<Link 
								key={link.path}
								href={link.path} 
								className={styles.navLink}
							>
								{link.label}
							</Link>
						))}
					</div>
				</div>
			</nav>
		</header>
	);
}
