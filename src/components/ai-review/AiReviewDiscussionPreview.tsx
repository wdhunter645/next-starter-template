'use client';

import { useEffect, useState } from 'react';
import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from '@/components/fanclub/clubHomeStyles';

type Discussion = {
  id: number;
  title: string;
  body: string;
  created_at: string;
};

type Props = {
  discussions?: Discussion[];
};

export default function AiReviewDiscussionPreview({ discussions }: Props) {
  const [items, setItems] = useState<Discussion[]>(discussions ?? []);
  const [status, setStatus] = useState(discussions ? '' : 'Loading discussion preview…');

  useEffect(() => {
    if (discussions) {
      setItems(discussions);
      setStatus('');
      return;
    }

    let alive = true;
    void (async () => {
      try {
        const response = await fetch('/api/discussions/list?limit=5', { cache: 'no-store' });
        if (!response.ok) {
          if (!alive) return;
          setItems([]);
          setStatus('Discussion preview unavailable without member session.');
          return;
        }
        const data = (await response.json().catch(() => ({}))) as { items?: Discussion[] };
        if (!alive) return;
        setItems(Array.isArray(data.items) ? data.items.slice(0, 5) : []);
        setStatus('');
      } catch {
        if (!alive) return;
        setItems([]);
        setStatus('Discussion preview unavailable in this environment.');
      }
    })();
    return () => {
      alive = false;
    };
  }, [discussions]);

  return (
    <section aria-label="Discussion feed" style={clubHomeSectionCard}>
      <h2 style={clubHomeSectionTitle}>Fan Club Discussion</h2>
      {status ? <p style={clubHomeMutedText}>{status}</p> : null}
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: 10 }}>
            <strong>{item.title}</strong>
            <div style={clubHomeMutedText}>{item.body}</div>
          </li>
        ))}
      </ul>
      {!status && items.length === 0 ? (
        <p style={clubHomeMutedText}>No discussion posts available for preview.</p>
      ) : null}
    </section>
  );
}
