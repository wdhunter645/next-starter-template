'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Photo = { id: number; url: string; description?: string; title?: string };
type WeekData = {
  week_start: string;
  photos: { a: Photo | null; b: Photo | null };
  totals: { a: number; b: number; winner: 'a' | 'b' | 'tie' };
  status: string;
};

export default function WeeklyVotePage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [current, setCurrent] = useState<WeekData | null>(null);
  const [prior, setPrior] = useState<WeekData | null>(null);

  const currentKey = useMemo(() => (current?.week_start ? `lgfc_voted_${current.week_start}` : ''), [current?.week_start]);
  const hasVoted = useMemo(() => {
    if (!currentKey) return false;
    try { return window.localStorage.getItem(currentKey) === '1'; } catch { return false; }
  }, [currentKey]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch('/api/matchup/results');
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to load results.');
        if (!alive) return;
        setCurrent(data.current || null);
        setPrior(data.prior || null);
      } catch (e: unknown) {
        if (!alive) return;
        setErr(String(e instanceof Error ? e.message : e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const box: React.CSSProperties = { border: '1px solid rgba(0,0,0,0.15)', borderRadius: 16, padding: 16, marginTop: 14 };

  return (
    <main style={{ padding: '40px 16px', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 12px 0' }}>Weekly Vote Results</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        This page is revealed after voting. If you haven’t voted yet, go back and vote first.
      </p>

      {!hasVoted ? (
        <div style={box}>
          <p style={{ margin: 0 }}>
            You have not voted yet for the current week. Please vote on the home page first.
          </p>
          <div style={{ marginTop: 10 }}>
            <Link href="/" style={{ textDecoration: 'underline' }}>Return to Home</Link>
          </div>
        </div>
      ) : null}

      {loading ? <p>Loading…</p> : null}
      {err ? <p>Error: {err}</p> : null}

      {current ? (
        <div style={box}>
          <h2 style={{ margin: '0 0 10px 0' }}>This Week ({current.week_start})</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {(['a','b'] as const).map((k) => {
              const p = current.photos?.[k];
              const total = current.totals?.[k] ?? 0;
              return (
                <div key={k} style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p?.url ? <img src={p.url} alt={p.description || p.title || `Photo ${p.id}`} style={{ width: '100%', height: 180, objectFit: 'cover' }} /> : null}
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700 }}>Photo {p?.id ?? '—'}</div>
                    <div style={{ opacity: 0.85, marginTop: 4 }}>{p?.description || ''}</div>
                    <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800 }}>{total} votes</div>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: 12, marginBottom: 0 }}>
            Winner: <b>{current.totals.winner === 'tie' ? 'Tie' : `Photo ${current.photos[current.totals.winner]?.id}`}</b>
          </p>
        </div>
      ) : null}

      {prior ? (
        <div style={box}>
          <h2 style={{ margin: '0 0 10px 0' }}>Last Week ({prior.week_start})</h2>
          <p style={{ margin: 0 }}>
            Winner: <b>{prior.totals.winner === 'tie' ? 'Tie' : `Photo ${prior.photos[prior.totals.winner]?.id}`}</b>
            {' '}— totals {prior.totals.a} vs {prior.totals.b}
          </p>
        </div>
      ) : null}
    </main>
  );
}
