'use client';

import React, { useEffect, useState } from 'react';

type MilestoneItem = {
  id: number;
  year: number | null;
  title: string;
  description: string | null;
  photo_id: number | null;
  photo_url: string | null;
};

type ApiResponse = { ok: boolean; items?: MilestoneItem[]; error?: string };

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [items, setItems] = useState<MilestoneItem[]>([]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const res = await fetch('/api/milestones/list?limit=100');
        const data = (await res.json()) as ApiResponse;
        if (!data.ok) throw new Error(data.error || 'Milestones load failed');
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
  }, []);

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Milestones</h1>

      <p style={{ ...styles.lead }}>
        This page is driven by the <code>milestones</code> table in D1. Admins can post and update milestones without redeploying the site.
      </p>

      {loading ? <p>Loading…</p> : null}
      {err ? <p style={{ color: '#b00020', fontWeight: 700 }}>{err}</p> : null}

      {!loading && !err && items.length === 0 ? (
        <p style={{ opacity: 0.9 }}>No posted milestones yet.</p>
      ) : null}

      <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        {items.map(m => (
          <article key={m.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ ...styles.h2, margin: 0 }}>
                {m.year ? <span style={{ marginRight: 10 }}>{m.year}</span> : null}
                {m.title}
              </h2>
            </div>

            {m.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.photo_url}
                alt={m.title}
                style={{ width: '100%', maxWidth: 900, borderRadius: 14, marginTop: 12, border: '1px solid rgba(0,0,0,0.10)' }}
              />
            ) : null}

            {m.description ? (
              <p style={{ ...styles.p, marginTop: 12, whiteSpace: 'pre-wrap' }}>{m.description}</p>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 1100, margin: "0 auto" },
  h1: { fontSize: 34, margin: "0 0 8px 0" },
  lead: { fontSize: 16, lineHeight: 1.7, margin: "0 0 18px 0" },
  h2: { fontSize: 20, margin: "0 0 8px 0" },
  p: { fontSize: 16, lineHeight: 1.7, margin: 0 },
  card: { border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16, padding: 16, background: "#fff" },
};
