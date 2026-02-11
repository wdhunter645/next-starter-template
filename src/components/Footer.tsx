'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Footer.module.css";

type FooterQuote = {
  quote?: string;
  attribution?: string;
};

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function parseFooterQuote(value: unknown): FooterQuote {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  const quoteObj = (v.quote && typeof v.quote === "object") ? (v.quote as Record<string, unknown>) : undefined;

  return {
    quote: asString(quoteObj?.quote),
    attribution: asString(quoteObj?.attribution),
  };
}

export default function Footer() {
  const [quote, setQuote] = useState<FooterQuote>({});

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/footer-quote", { cache: "no-store" });
        const raw: unknown = await res.json().catch(() => ({}));
        const q = parseFooterQuote(raw);

        if (!mounted) return;
        setQuote(q);
      } catch {
        // leave empty
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.quote}>
            {quote.quote ? (
              <>
                <span className={styles.quoteText}>&ldquo;{quote.quote}&rdquo;</span>
                {quote.attribution ? <span className={styles.quoteAttr}> — {quote.attribution}</span> : null}
              </>
            ) : (
              <span className={styles.quoteText}>&nbsp;</span>
            )}
          </div>
          <div className={styles.legal}>© {new Date().getFullYear()} Lou Gehrig Fan Club</div>
        </div>

        <div className={styles.center}>
          <a className={styles.centerLogoLink} href="#top" aria-label="Back to top">
            <img className={styles.centerLogoImg} src="/img/lgfc-logo.png" alt="" aria-hidden="true" decoding="async" />
          </a>
        </div>

        <div className={styles.right}>
          <Link className={styles.footerLink} href="/contact">
            Contact
          </Link>
          <Link className={styles.footerLink} href="/support">
            Support
          </Link>
          <Link className={styles.footerLink} href="/terms">
            Terms
          </Link>
          <Link className={styles.footerLink} href="/privacy">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
