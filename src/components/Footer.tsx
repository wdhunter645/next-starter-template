'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Footer.module.css";

// Environment variables with safe fallbacks
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Lou Gehrig Fan Club";

export default function Footer() {
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		// Check if user is admin
		async function checkAdmin() {
			if (typeof window === 'undefined') return;
			
			const email = window.localStorage.getItem('lgfc_member_email');
			if (!email) {
				setIsAdmin(false);
				return;
			}

			try {
				const res = await fetch(`/api/member/role?email=${encodeURIComponent(email)}`);
				const data = await res.json();
				if (data?.ok && data?.role === 'admin') {
					setIsAdmin(true);
				}
			} catch {
				// Fail silently - admin link just won't show
				setIsAdmin(false);
			}
		}

		checkAdmin();
	}, []);

	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={styles.copyright}>
						<p>
							&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Contact:
							{' '}
							<a href="mailto:LouGehrigFanClub@gmail.com">LouGehrigFanClub@gmail.com</a>
						</p>
					</div>
					<div className={styles.links}>
						<Link href="/privacy" className={styles.link}>
							Privacy
						</Link>
						<Link href="/terms" className={styles.link}>
							Terms
						</Link>
						{isAdmin && (
							<Link href="/admin" className={styles.link}>
								Admin
							</Link>
						)}
					</div>
				</div>
			</div>
		</footer>
	);
}
