'use client';

import React, { useEffect, useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';
import { buildFanclubPhotoListApiUrl } from '@/lib/fanclubApi';

type MemorabiliaItem = { id: number; thumbnail_url?: string | null; title?: string | null; description?: string | null };

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '40px 16px', maxWidth: 1100, margin: '0 auto' },
  h1: { fontSize: 34, lineHeight: 1.15, margin: '0 0 12px 0' },
  lead: { fontSize: 18, lineHeight: 1.6, margin: '0 0 18px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  card: { border: '1px solid rgba(0,0,0,0.15)', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.6)' },
  img: { width: '100%', height: 160, objectFit: 'cover', display: 'block' },
  cap: { padding: 10, fontSize: 13, lineHeight: 1.4, opacity: 0.9 },
  btnRow: { display: 'flex', gap: 10, marginTop: 14 },
  btn: { padding: '10px 14px', fontSize: 16, borderRadius: 12, border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' },
};

export default function MemorabiliaPage() {
  const { isLoading, isAuthenticated } = useMemberSession({ redirectTo: '/' });
  const [items, setItems] = useState<MemorabiliaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 24;

  async function load(nextOffset: number) {
    setLoading(true);
    try {
      const res = await fetch(buildFanclubPhotoListApiUrl({ limit, offset: nextOffset, memorabilia: true }));
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        const incoming = Array.isArray(data.items) ? data.items : [];
        if (nextOffset === 0) setItems(incoming);
        else setItems((prev) => [...prev, ...incoming]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      load(0);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Memorabilia</h1>
      <p style={{ ...styles.lead }}>A filtered view of memorabilia-tagged records sourced from the photos archive.</p>

      <div style={{ ...styles.grid }}>
        {items.map((p) => (
          <div key={p.id} style={{ ...styles.card }}>
            {p.thumbnail_url ? (
              <img src={p.thumbnail_url} alt={p.description || p.title || `Item ${p.id}`} style={{ ...styles.img }} />
            ) : (
              <div style={{ ...styles.img, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No image</div>
            )}
            <div style={{ ...styles.cap }}>{p.title || p.description || '—'}</div>
          </div>
        ))}
      </div>

      <div style={{ ...styles.btnRow }}>
        <button
          style={{ ...styles.btn }}
          disabled={loading}
          onClick={() => {
            const next = offset + limit;
            setOffset(next);
            load(next);
          }}
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
        <a style={{ ...styles.btn, textDecoration: 'none' }} href="/fanclub/photo">
          View photos
        </a>
      </div>
    </main>
  );
}
