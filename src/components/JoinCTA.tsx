import Link from "next/link";
import styles from "./JoinCTA.module.css";

export default function JoinCTA() {
	return (
		<section className={styles.cta}>
			<div className={styles.container}>
				<p className={styles.text}>Become part of the Lou Gehrig Fan Club community.</p>
				<Link href="/member" className={styles.button}>
					Join Now
				</Link>
			</div>
		</section>
	);
}
