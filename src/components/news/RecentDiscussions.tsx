'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Discussion = { id: number; title: string; body: string; created_at: string };
type ApiResponse = { ok: boolean; items?: Discussion[]; error?: string };

export default function RecentDiscussions({ limit = 5 }: { limit?: number }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [items, setItems] = useState<Discussion[]>([]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const res = await fetch(`/api/discussions/list?limit=${encodeURIComponent(String(limit))}`);
        const data = (await res.json()) as ApiResponse;
        if (!data.ok) throw new Error(data.error || 'Load failed');
        if (!alive) return;
        setItems(data.items || []);
      } catch (e: any) {
        if (!alive) return;
        setItems([]);
        setErr(String(e?.message || e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [limit]);

  return (
    <section style={{ marginTop: 26 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Latest Discussions</h2>
        <Link href="/ask" style={{ fontWeight: 800, textDecoration: 'none' }}>Ask a question →</Link>
      </div>

      {loading ? <p style={{ marginTop: 10 }}>Loading…</p> : null}
      {err ? <p style={{ marginTop: 10, color: '#b00020', fontWeight: 700 }}>{err}</p> : null}
      {!loading && !err && items.length === 0 ? <p style={{ marginTop: 10, opacity: 0.9 }}>No posted discussions yet.</p> : null}

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {items.map(d => (
          <article key={d.id} style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, padding: 16, background: '#fff' }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{d.created_at}</div>
            <h3 style={{ margin: '6px 0 0 0', fontSize: 18 }}>{d.title}</h3>
            <p style={{ margin: '10px 0 0 0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {String(d.body || '').slice(0, 280)}{String(d.body || '').length > 280 ? '…' : ''}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
