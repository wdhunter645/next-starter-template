'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Friend = {
  id: number;
  name: string;
  kind: string;
  url?: string | null;
  blurb?: string | null;
  photo_url?: string | null;
};

export default function FriendsOfFanClub() {
  const [items, setItems] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Friend[] }>(`/api/friends/list`);
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
    <div>
      <h2 className="section-title">Friends of the Fan Club</h2>
      <p className="sub">Tiles pulled live from D1 friends table.</p>

      {loading ? (
        <p className="sub">Loading…</p>
      ) : items.length === 0 ? (
        <p className="sub">No friends yet (D1 table is empty).</p>
      ) : (
        <div className="grid">
          {items.map((f) => (
            <div key={f.id} className="card">
              {f.photo_url ? (
                <img
                  src={f.photo_url}
                  alt={f.name}
                  style={{ width: '100%', borderRadius: 12, marginBottom: 10 }}
                />
              ) : null}
              <strong>{f.name}</strong>
              <div className="sub" style={{ marginTop: 6 }}>{f.blurb || f.kind}</div>
              {f.url ? (
                <div style={{ marginTop: 10 }}>
                  <a className="link" href={f.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Visit</a>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
