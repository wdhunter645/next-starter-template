import Link from "next/link";
import styles from "./JoinLogin.module.css";

export default function JoinLogin() {
	return (
		<section className={styles.joinLogin}>
			<div className={styles.container}>
				<div className={styles.buttons}>
					<Link href="/member/join" className={styles.primaryButton}>
						Join the Club
					</Link>
					<Link href="/member/login" className={styles.secondaryButton}>
						Member Login
					</Link>
				</div>
			</div>
		</section>
	);
}
