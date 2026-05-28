'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Milestone = {
  id: number;
  year: number | null;
  title: string;
  description?: string | null;
  milestone_date?: string | null;
};

export default function GehrigTimeline() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Milestone[] }>('/api/milestones/list?limit=12');
        if (!alive) return;

        const normalized = Array.isArray(data?.items)
          ? data.items.filter((m): m is Milestone => typeof m?.id === 'number' && typeof m?.title === 'string')
          : [];

        setItems(normalized);
        setError(null);
      } catch {
        if (!alive) return;
        setItems([]);
        setError('Unable to load Gehrig timeline entries right now.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      aria-label="Gehrig timeline"
      style={{
        padding: 16,
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 12,
        background: '#fff',
      }}
    >
      <h2 style={{ margin: '0 0 12px 0', fontSize: 22 }}>Gehrig Timeline</h2>

      {loading ? (
        <p style={{ margin: 0, color: 'rgba(0,0,0,0.72)' }}>Loading timeline…</p>
      ) : error ? (
        <p style={{ margin: 0, color: '#b00020' }}>{error}</p>
      ) : items.length === 0 ? (
        <p style={{ margin: 0, color: 'rgba(0,0,0,0.72)' }}>No timeline entries are available yet.</p>
      ) : (
        <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 10 }}>
          {items.map((entry) => (
            <li key={entry.id} style={{ lineHeight: 1.5 }}>
              <strong>
                {entry.year ?? entry.milestone_date ?? '—'}: {entry.title}
              </strong>
              {entry.description ? (
                <p style={{ margin: '6px 0 0', color: 'rgba(0,0,0,0.75)' }}>{entry.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
