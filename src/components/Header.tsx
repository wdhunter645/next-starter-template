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
						aria-label="Lou Gehrig Fan Club Home"
					>
						LGFC
					</Link>
					<div className={styles.navLinks}>
						<Link href="/weekly" className={styles.navLink}>
							Weekly Matchup
						</Link>
						<Link href="/charities" className={styles.navLink}>
							Charities
						</Link>
						<Link href="/news" className={styles.navLink}>
							News &amp; Q&amp;A
						</Link>
						<Link href="/calendar" className={styles.navLink}>
							Calendar
						</Link>
						<Link href="/member" className={styles.navLink}>
							Join
						</Link>
					</div>
				</div>
			</nav>
		</header>
	);
}
