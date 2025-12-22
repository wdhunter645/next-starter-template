import Link from "next/link";
import styles from "./Footer.module.css";

// Environment variables with safe fallbacks
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Lou Gehrig Fan Club";

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
					</div>
				</div>
			</div>
		</footer>
	);
}
