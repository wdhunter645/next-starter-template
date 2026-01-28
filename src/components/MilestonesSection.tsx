'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Milestone = {
  id: number;
  year: number | null;
  title: string;
  description?: string | null;
  photo_url?: string | null;
};

export default function MilestonesSection() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let completed = false;
    
    const timer = setTimeout(() => {
      if (alive && !completed) {
        setLoading(false);
        setItems([]);
      }
    }, 10000); // 10 second timeout
    
    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Milestone[] }>(`/api/milestones/list?limit=40`);
        if (alive) setItems(data.items || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) {
          setLoading(false);
          completed = true;
        }
      }
    })();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div>
      <h2 className="section-title">Milestones</h2>
      <p className="sub">Pulled live from D1 milestones table.</p>

      {loading ? (
        <p className="sub">Loading milestones…</p>
      ) : items.length === 0 ? (
        <p className="sub">Milestones coming soon. Check back later!</p>
      ) : (
        <div className="grid">
          {items.map((m) => (
            <div key={m.id} className="card">
              <strong>
                {(m.year ?? '—')}: {m.title}
              </strong>
              {m.photo_url ? (
                <div style={{ marginTop: 10 }}>
                  <img src={m.photo_url} alt={m.title} style={{ width: '100%', borderRadius: 12 }} />
                </div>
              ) : null}
              {m.description ? <p className="sub" style={{ marginTop: 10 }}>{m.description}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
