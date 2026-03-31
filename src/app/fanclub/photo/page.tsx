'use client';

import { useEffect, useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';
import { buildFanclubPhotoListApiUrl } from '@/lib/fanclubApi';

type PhotoItem = {
  id: number;
  title?: string;
  url?: string;
  description?: string;
};

export default function FanclubPhotoGalleryPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const { isLoading, isAuthenticated, email } = useMemberSession({ redirectTo: '/' });

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(buildFanclubPhotoListApiUrl({ limit: 60 }), { cache: 'no-store' });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'list_failed');
      setItems(json.items || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
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
    if (!isLoading && isAuthenticated) {
      load();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
      <h1 style={{ fontSize: 32, margin: '0 0 8px 0' }}>Photo Gallery</h1>

      {loading && <p>Loading…</p>}
      {err && <p>Error: {err}</p>}

      {!loading && !err && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {items.map((p) => (
            <div key={p.id}>
              {p.url ? <img src={p.url} alt={p.title || ''} style={{ width: '100%' }} /> : <span>No URL</span>}
              <button onClick={() => reportPhoto(p.id)}>Report</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
