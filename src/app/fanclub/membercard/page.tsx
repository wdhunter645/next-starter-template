'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';

type MemberCardContent = {
  id: number;
  title: string | null;
  body_md: string | null;
  updated_at: string | null;
};

export default function MemberCardPage() {
  const { isLoading, isAuthenticated } = useMemberSession({ redirectTo: '/' });
  const [content, setContent] = useState<MemberCardContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setMessage('');
      try {
        const res = await fetch('/api/content/membercard', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setMessage(data?.error || 'Unable to load member card content.');
          setContent(null);
          return;
        }
        setContent(data.content || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main style={{ padding: '40px 16px', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 12px 0' }}>{content?.title || 'Membership Card'}</h1>
      <p style={{ marginTop: 0, opacity: 0.88, whiteSpace: 'pre-wrap' }}>
        {content?.body_md ||
          'Your membership card is a digital keepsake. Save the front and back card images below for personal use and sharing.'}
      </p>

      {loading ? <p>Loading member card…</p> : null}
      {message ? <p style={{ opacity: 0.85 }}>{message}</p> : null}

      <section
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          marginTop: 20,
        }}
      >
        <figure style={{ margin: 0 }}>
          <img
            src="/membercard-front.png"
            alt="Membership card - front"
            style={{ width: 190, height: 'auto', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)' }}
          />
          <figcaption style={{ fontSize: 12, opacity: 0.75, marginTop: 6, textAlign: 'center' }}>Front</figcaption>
        </figure>
        <figure style={{ margin: 0 }}>
          <img
            src="/membercard-back.png"
            alt="Membership card - back"
            style={{ width: 190, height: 'auto', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)' }}
          />
          <figcaption style={{ fontSize: 12, opacity: 0.75, marginTop: 6, textAlign: 'center' }}>Back</figcaption>
        </figure>
      </section>

      <section style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/fanclub/myprofile" style={{ textDecoration: 'none' }}>
          <span
            style={{
              display: 'inline-flex',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.2)',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            Back to My Profile
          </span>
        </Link>
        <Link href="/fanclub" style={{ textDecoration: 'none' }}>
          <span
            style={{
              display: 'inline-flex',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.2)',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            Back to Fan Club Home
          </span>
        </Link>
      </section>
    </main>
  );
}
