'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Photo = {
  id: number;
  url: string;
  description?: string;
  photo_id?: string;
};

export default function WeeklyMatchup() {
  const [items, setItems] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Photo[] }>(`/api/matchup/current`);
        if (alive) setItems(data.items || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="container">
      <h2 className="section-title">Weekly Photo Matchup — Vote for your favorite</h2>
      <p className="sub">Two photos pulled live from D1 photos table.</p>

      {loading ? (
        <p className="sub">Loading…</p>
      ) : items.length < 2 ? (
        <p className="sub">Not enough photos in D1 yet to show a matchup.</p>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {items.slice(0, 2).map((p) => (
            <div key={p.id} className="card" style={{ textAlign: 'center' }}>
              <img src={p.url} alt={p.description || 'Lou Gehrig'} style={{ width: '100%', borderRadius: 12 }} />
              <div className="sub" style={{ marginTop: 10 }}>{p.description || 'Photo from archive'}</div>
              <div style={{ marginTop: 12, fontWeight: 700, color: 'var(--lgfc-blue)' }}>
                Voting wired next (Phase: Day 2)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
