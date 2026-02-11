'use client';

import { useEffect, useState } from 'react';

type PhotoItem = {
  id: number;
  title: string;
  b2_key?: string;
  url?: string;
  b2_url?: string;
  created_at?: string;
};

function getLocalEmail(): string {
  try { return window.localStorage.getItem('lgfc_member_email') || ''; } catch { return ''; }
}

export default function FanclubPhotoGalleryPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [email, setEmail] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/photos/list?limit=60', { cache: 'no-store' });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'list_failed');
      setItems(json.items || []);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function reportPhoto(id: number) {
    const reason = window.prompt('Report this photo: what is incorrect? (tags, description, etc)') || '';
    if (reason.trim().length < 5) return;

    const res = await fetch('/api/reports/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'photo', target_id: id, reporter_email: email, reason }),
    });
    const json = await res.json();
    if (!json?.ok) {
      window.alert(`Report failed: ${json?.error || 'unknown_error'}`);
      return;
    }
    window.alert('Report submitted.');
  }

  useEffect(() => {
    setEmail(getLocalEmail());
    load();
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
      <h1 style={{ fontSize: 32, margin: '0 0 8px 0' }}>Photo Gallery</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Browse photos. Use “Report” to flag incorrect tags or descriptions for admin review.
      </p>

      <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
        <button
          onClick={load}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      {loading && <p style={{ opacity: 0.85 }}>Loading…</p>}
      {err && <p style={{ color: 'salmon' }}>Error: {err}</p>}

      {!loading && !err && (
        <div style={{ marginTop: 14, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {items.map((p) => {
            const src = (p as any).b2_url || (p as any).url || '';
            return (
              <div key={p.id} style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={p.title || `Photo ${p.id}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ opacity: 0.75, fontSize: 12, padding: 10 }}>No URL available</span>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{p.title || `Photo #${p.id}`}</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => reportPhoto(p.id)}
                      style={{ padding: '7px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', cursor: 'pointer', opacity: 0.9 }}
                    >
                      Report
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', opacity: 0.85 }}>
              No photos found.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
