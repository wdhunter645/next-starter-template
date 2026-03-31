'use client';

import { useEffect, useState } from 'react';

type DiscussionItem = {
  id: number;
  title: string;
  body: string;
  created_at: string;
};

export default function DiscussionFeed({ refreshTrigger }: { refreshTrigger?: number }) {
  const [items, setItems] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/discussions/list?limit=12', { cache: 'no-store' });
      const json = await res.json();
      if (json?.ok) setItems(json.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshTrigger]);

  return (
    <section
      aria-label="Discussion feed"
      style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.72)' }}
    >
      <h2 style={{ margin: 0, fontSize: 20 }}>Discussion</h2>

      {loading && <p style={{ marginTop: 10 }}>Loading…</p>}

      {!loading && items.length === 0 && (
        <p style={{ marginTop: 10, opacity: 0.8 }}>No posts yet.</p>
      )}

      <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
        {items.map((it) => (
          <article key={it.id} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <strong>{it.title}</strong>
              <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>
                {new Date(it.created_at).toLocaleDateString()}
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', whiteSpace: 'pre-wrap' }}>{it.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
