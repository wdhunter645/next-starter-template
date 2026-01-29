'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Discussion = {
  id: number;
  title: string;
  body: string;
  author_email?: string;
  created_at: string;
};

export default function RecentDiscussions() {
  const [items, setItems] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Discussion[] }>(`/api/discussions/list?limit=10`);
        if (alive) setItems(data.items || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <p className="sub" style={{ textAlign: 'center' }}>Loading…</p>;
  if (items.length === 0) return <p className="sub" style={{ textAlign: 'center' }}>No member discussions yet (D1 table is empty).</p>;

  return (
    <div className="grid">
      {items.slice(0, 10).map((d) => (
        <div key={d.id} className="card">
          <strong>{d.title}</strong>
          <div className="sub" style={{ marginTop: 8 }}>{d.body.slice(0, 160)}{d.body.length > 160 ? '…' : ''}</div>
          <div className="sub" style={{ marginTop: 10, opacity: 0.7 }}>Posted: {d.created_at}</div>
        </div>
      ))}
    </div>
  );
}
