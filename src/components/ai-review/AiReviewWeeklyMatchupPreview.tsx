'use client';

import { useEffect, useState } from 'react';
import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from '@/components/fanclub/clubHomeStyles';

type Photo = {
  id: number;
  url: string;
  title?: string;
  description?: string;
};

export default function AiReviewWeeklyMatchupPreview() {
  const [items, setItems] = useState<Photo[]>([]);
  const [status, setStatus] = useState('Loading weekly matchup preview…');

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const response = await fetch('/api/matchup/current', { cache: 'no-store' });
        if (!response.ok) {
          if (!alive) return;
          setStatus('Weekly matchup preview unavailable.');
          return;
        }
        const data = (await response.json()) as { items?: Photo[] };
        if (!alive) return;
        setItems(Array.isArray(data.items) ? data.items.slice(0, 2) : []);
        setStatus('');
      } catch {
        if (!alive) return;
        setStatus('Weekly matchup preview unavailable.');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section aria-label="Weekly photo matchup (read-only)" style={clubHomeSectionCard}>
      <h2 style={clubHomeSectionTitle}>Weekly Photo Matchup</h2>
      <p style={clubHomeMutedText}>Voting controls are disabled in AI review mode.</p>
      {status ? <p style={clubHomeMutedText}>{status}</p> : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {items.map((item) => (
          <div key={item.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.title || item.description || 'Matchup photo'} style={{ width: '100%', borderRadius: 12 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
