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

const DEFAULT_FRIENDS: Friend[] = [
  {
    id: -1,
    name: 'Live Like Lou Foundation',
    kind: 'Partner',
    url: 'https://www.livelikelou.org',
    blurb: 'Supporting ALS awareness and impact through community action.',
    photo_url: null,
  },
  {
    id: -2,
    name: 'ALS Cure Project',
    kind: 'Partner',
    url: 'https://www.ALSCure.org',
    blurb: 'Accelerating ALS research and funding the path to a cure.',
    photo_url: null,
  },
  {
    id: -3,
    name: 'They Played In Color',
    kind: 'Partner',
    url: 'https://www.theyplayedincolor.com/',
    blurb: 'Preserving and sharing baseball history with depth and accuracy.',
    photo_url: null,
  },
];

export default function FriendsOfFanClub() {
  const [items, setItems] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let completed = false;

    const timer = setTimeout(() => {
      if (alive && !completed) {
        setLoading(false);
        setItems(DEFAULT_FRIENDS);
      }
    }, 10000); // 10 second timeout

    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Friend[] }>(`/api/friends/list`);
        if (!alive) return;

        const list = Array.isArray(data.items) && data.items.length > 0 ? data.items : DEFAULT_FRIENDS;
        setItems(list);
      } catch {
        if (alive) setItems(DEFAULT_FRIENDS);
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
      <h2 className="section-title">Friends of the Fan Club</h2>

      {loading ? (
        <p className="sub">Loading friends…</p>
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
                  <a
                    className="link"
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                  >
                    Visit
                  </a>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
