'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Footer.module.css';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Lou Gehrig Fan Club';

type Quote = { quote: string; attribution?: string | null };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

export default function Footer() {
  const [footerQuote, setFooterQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Best-effort: pull one quote for rotation if available; silent failure is fine.
    (async () => {
      try {
        const res = await fetch('/api/footer-quote', { cache: 'no-store' });
        const data: unknown = await res.json().catch(() => ({}));

        if (!isRecord(data) || data.ok !== true) return;

        const item = (data as Record<string, unknown>).item;
        if (!isRecord(item)) return;

        const quote = asString(item.quote);
        if (!quote) return;

        const attribution = asString(item.attribution);
        setFooterQuote({ quote, attribution });
      } catch {
        // No-op
      }
    })();
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <span className={styles.quote}>&ldquo;{footerQuote.quote}&rdquo;</span>
                {footerQuote.attribution ? <span className={styles.attr}> — {footerQuote.attribution}</span> : null}
              </>
            ) : (
              <span className={styles.quote}>&ldquo;A community for baseball history, character, and courage.&rdquo;</span>
            )}
          </div>
          <div className={styles.legal}>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </div>
        </div>

        <div className={styles.center}>
          <button type="button" onClick={scrollToTop} className={styles.toTop} aria-label="Scroll to top">
            ↑
          </button>
        </div>

        <div className={styles.right}>
          <Link href="/contact">Contact</Link>
          <Link href="/support">Support</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
