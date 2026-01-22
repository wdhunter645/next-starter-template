'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Footer.module.css";
import { getCurrentPath } from "@/lib/urlUtils";

// Environment variables with safe fallbacks
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Lou Gehrig Fan Club";

export default function Footer() {
	const [isAdmin, setIsAdmin] = useState(false);
	const [footerQuote, setFooterQuote] = useState<{ quote: string; attribution?: string | null } | null>(null);

	useEffect(() => {
		// Check if user is admin
		async function checkAdmin() {
			if (typeof window === 'undefined') return;
			
			const email = window.localStorage.getItem('lgfc_member_email');
			// Validate email format before using it
			if (!email || !email.includes('@') || email.length < 3) {
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

	useEffect(() => {
		async function loadQuote() {
			try {
				const res = await fetch('/api/footer-quote');
				const data = await res.json();
				if (data?.ok && data?.quote?.quote) {
					setFooterQuote({ quote: String(data.quote.quote), attribution: data.quote.attribution ?? null });
				}
			} catch {
				// silent
			}
		}
		loadQuote();
	}, []);

	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				{footerQuote && (
					<div style={{ marginBottom: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12 }}>
						<span style={{ opacity: 0.95 }}>&ldquo;{footerQuote.quote}&rdquo;</span>
						{footerQuote.attribution && (
							<span style={{ marginLeft: 8, opacity: 0.85 }}>— {footerQuote.attribution}</span>
						)}
					</div>
				)}
				<div className={styles.content}>
					<div className={styles.copyright}>
						<p>
							&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
						</p>
					</div>
					<div className={styles.links}>
						<Link href="/privacy" className={styles.link}>
							Privacy
						</Link>
						<Link href="/terms" className={styles.link}>
							Terms
						</Link>
						<Link href="/contact" className={styles.link}>
							Contact
						</Link>
						<Link href={`/support?from=${encodeURIComponent(getCurrentPath())}`} className={styles.link}>
							Support
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
