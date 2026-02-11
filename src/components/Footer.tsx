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
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/footer-quote', { cache: 'no-store' });
        const data = (await res.json()) as unknown;
        if (cancelled) return;
        if (isRecord(data) && isRecord(data.quote)) {
          const q = asString((data.quote as any).quote);
          const a = asString((data.quote as any).attribution);
          if (q) setQuote({ quote: q, attribution: a });
        }
      } catch {
        // ignore - footer still renders
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function scrollToTop() {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.quoteLine}>
            <span className={styles.quoteMark}>“</span>
            <span className={styles.quoteText}>
              {quote?.quote || 'A community for baseball history, character, and courage.'}
            </span>
            <span className={styles.quoteMark}>”</span>
            {quote?.attribution ? <span className={styles.quoteAttr}> — {quote.attribution}</span> : null}
          </div>
          <div className={styles.legalLine}>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className={styles.centerLogo}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <img className={styles.logoImg} src="/IMG_1946.png" alt="LGFC" />
        </button>

        <div className={styles.right}>
          <Link className={styles.link} href="/contact">Contact</Link>
          <Link className={styles.link} href="/support">Support</Link>
          <Link className={styles.link} href="/terms">Terms</Link>
          <Link className={styles.link} href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
