'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Discussion = {
  id: number;
  title: string;
  body: string;
  created_at: string;
};

export default function RecentDiscussionsTeaser() {
  const [items, setItems] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Discussion[] }>(`/api/discussions/list?limit=5`);
        if (alive) setItems(data.items || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="recent-club-discussions" className="section-gap">
      <div className="container">
      <h2 className="section-title">Recent Club discussions</h2>
      <p className="sub" style={{ textAlign: 'center' }}>
        Pulled live from D1 discussions table (latest 5 posts).
      </p>

      {loading ? (
        <p className="sub" style={{ textAlign: 'center' }}>Loading…</p>
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
              <div className="sub" style={{ marginTop: 10, opacity: 0.75 }}>Posted: {p.created_at}</div>
            </div>
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
