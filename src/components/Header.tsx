import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
	return (
		<header className={styles.header}>
			<nav className={styles.nav} aria-label="Main navigation">
				<div className={styles.navContent}>
					<Link 
						href="/" 
						className={styles.logo}
						aria-label="Next.js Starter Home"
					>
						Next.js Starter
					</Link>
					<div className={styles.navLinks}>
						<Link href="/weekly" className={styles.navLink}>
							Features
						</Link>
						<Link href="/charities" className={styles.navLink}>
							Examples
						</Link>
						<Link href="/news" className={styles.navLink}>
							Docs
						</Link>
						<Link href="/calendar" className={styles.navLink}>
							Roadmap
						</Link>
						<Link href="/member" className={styles.navLink}>
							Get Started
						</Link>
					</div>
				</div>
			</nav>
		</header>
	);
}
