'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Footer.module.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Lou Gehrig Fan Club";

type Quote = { quote: string; attribution?: string | null };

export default function Footer() {
  const [footerQuote, setFooterQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Best-effort: pull one quote for rotation if available; silent failure is fine.
    (async () => {
      try {
        const res = await fetch("/api/quotes/random");
        const data = await res.json();
        if (data?.ok && data?.quote) {
          setFooterQuote({ quote: data.quote, attribution: data.attribution ?? null });
        }
      } catch {
        // No-op
      }
    })();
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.quoteLine}>
            {footerQuote ? (
              <>
                <span className={styles.quoteMark}>&ldquo;</span>
                <span className={styles.quoteText}>{footerQuote.quote}</span>
                <span className={styles.quoteMark}>&rdquo;</span>
                {footerQuote.attribution ? <span className={styles.quoteAttr}> — {footerQuote.attribution}</span> : null}
              </>
            ) : (
              <span className={styles.quoteText}>&nbsp;</span>
            )}
          </div>
          <div className={styles.legalLine}>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </div>
        </div>

        <button type="button" className={styles.centerLogo} onClick={scrollToTop} aria-label="Back to top">
          <img src="/IMG_1946.png" alt="LGFC" className={styles.logoImg} />
        </button>

        <div className={styles.right}>
          <Link href="/contact" className={styles.link}>Contact</Link>
          <a href="mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed" className={styles.link}>Support</a>
          <Link href="/terms" className={styles.link}>Terms</Link>
          <Link href="/privacy" className={styles.link}>Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
