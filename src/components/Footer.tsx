'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Quote = { quote: string; source?: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export default function Footer() {
  const [q, setQ] = useState<Quote | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadQuote() {
      try {
        const res = await fetch('/api/footer-quote', { cache: 'no-store' });
        const json: unknown = await res.json().catch(() => null);

        if (!isRecord(json)) return;

        // expected shape: { ok:true, quote:{ quote:string, source?:string } }
        const quoteObj = isRecord(json.quote) ? (json.quote as Record<string, unknown>) : null;
        if (!quoteObj) return;

        const quote = asString(quoteObj.quote);
        const source = asString(quoteObj.source);

        if (!quote) return;

        if (!cancelled) setQ({ quote, source });
      } catch {
        // ignore
      }
    }

    loadQuote();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer style={{ borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: 40 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}>
        {q && (
          <div style={{ fontStyle: 'italic', marginBottom: 10 }}>
            “{q.quote}”
            {q.source ? <span style={{ fontStyle: 'normal', marginLeft: 8 }}>— {q.source}</span> : null}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>
            © {new Date().getFullYear()} Lou Gehrig Fan Club
          </div>

          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            <Link href="/contact">Contact</Link>
            <Link href="/support">Support</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
