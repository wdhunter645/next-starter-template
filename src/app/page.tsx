import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
	return (
		<div className={styles.hero}>
			<div className={styles.container}>
				<h1 className={styles.title}>Next.js Starter Template</h1>
				<p className={styles.subtitle}>A modern Next.js application deployed on Cloudflare</p>
				<p className={styles.mission}>
					Get started with Next.js 15, React 19, TypeScript, and Tailwind CSS 4. Deploy instantly to Cloudflare Workers.
				</p>
				<div className={styles.actions}>
					<Link href="/member" className={styles.primaryButton}>
						Get Started
					</Link>
				</div>
			</div>
		</div>
	);
}
