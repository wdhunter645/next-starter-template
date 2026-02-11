'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Footer.module.css';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Lou Gehrig Fan Club';

type Quote = { quote: string; attribution?: string | null };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export default function Footer() {
  const [footerQuote, setFooterQuote] = useState<Quote | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/footer-quote', { cache: 'no-store' });
        const data = await res.json().catch(() => ({} as any));
        if (!alive) return;

        if (data?.ok && isRecord(data) && isRecord((data as any).item)) {
          const item = (data as any).item;
          const q = asString(item.quote);
          const a = asString(item.attribution);
          if (q) setFooterQuote({ quote: q, attribution: a || null });
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
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
            <img className={styles.centerLogo} src="/IMG_1946.png" alt="LGFC" />
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
