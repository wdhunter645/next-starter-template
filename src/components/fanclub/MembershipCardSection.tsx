'use client';

import { useEffect, useState } from 'react';
import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from './clubHomeStyles';

type MemberCardContent = {
  id: number;
  title: string | null;
  body_md: string | null;
  updated_at: string | null;
};

export default function MembershipCardSection() {
  const [content, setContent] = useState<MemberCardContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setMessage('');
      try {
        const res = await fetch('/api/content/membercard', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setMessage(data?.error || 'Unable to load membership card content.');
          setContent(null);
          return;
        }
        setContent(data.content || null);
      } catch {
        if (cancelled) return;
        setMessage('Unable to load membership card content.');
        setContent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="membership-card" aria-label="Membership card section" style={clubHomeSectionCard}>
      <h2 style={clubHomeSectionTitle}>{content?.title || 'Membership Card'}</h2>
      <p style={{ ...clubHomeMutedText, whiteSpace: 'pre-wrap' }}>
        {content?.body_md ||
          'Your membership card is a digital keepsake. Save the front and back card images below for personal use and sharing.'}
      </p>

      {loading ? <p style={clubHomeMutedText}>Loading membership card…</p> : null}
      {message ? <p style={{ ...clubHomeMutedText, color: '#8a1f1f' }}>{message}</p> : null}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 16 }}>
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
      </div>
    </section>
  );
}
