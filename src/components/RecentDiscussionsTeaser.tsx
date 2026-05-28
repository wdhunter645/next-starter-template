'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Discussion = {
  id: number;
  title: string;
  body: string;
  created_at: string;
};

const safeText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeDiscussion = (raw: unknown): Discussion | null => {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<Discussion>;
  if (typeof candidate.id !== 'number') return null;

  const title = safeText(candidate.title) ?? 'Untitled discussion';
  const body = safeText(candidate.body) ?? 'No discussion text available.';
  const createdAt = safeText(candidate.created_at) ?? '';

  return {
    id: candidate.id,
    title,
    body,
    created_at: createdAt,
  };
};

const formatCreatedAt = (raw: string): string => {
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return raw || 'Unknown date';

  return new Date(parsed).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function RecentDiscussionsTeaser() {
  const [items, setItems] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Discussion[] }>(`/api/discussions/list?limit=5`);
        if (!alive) return;

        const normalized = Array.isArray(data.items)
          ? data.items
              .map((item) => normalizeDiscussion(item))
              .filter((item): item is Discussion => item !== null)
          : [];

        setItems(normalized);
        setError(null);
      } catch {
        if (!alive) return;
        setItems([]);
        setError('Unable to load discussions right now.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="recent-club-discussions" className="container section-gap">
      <h2 className="section-title">Recent Club discussions</h2>
      <p className="sub" style={{ textAlign: 'center' }}>
        Pulled live from D1 discussions table (latest 5 posts).
      </p>

      {loading ? (
        <p className="sub" style={{ textAlign: 'center' }}>Loading…</p>
      ) : error ? (
        <p className="sub" style={{ textAlign: 'center' }}>{error}</p>
      ) : items.length === 0 ? (
        <p className="sub" style={{ textAlign: 'center' }}>No posts yet (D1 table is empty).</p>
      ) : (
        <div className="grid">
          {items.map((p) => (
            <div key={p.id} className="card">
              <strong>{p.title}</strong>
              <p className="sub" style={{ marginTop: 10 }}>
                {p.body.length > 180 ? `${p.body.slice(0, 180)}…` : p.body}
              </p>
              <div className="sub" style={{ marginTop: 10, opacity: 0.75 }}>
                Posted: {formatCreatedAt(p.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
