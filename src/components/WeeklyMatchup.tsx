'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Photo = {
  id: number;
  url: string;
  description?: string;
  title?: string;
};

export default function WeeklyMatchup() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<string>('');
  const [a, setA] = useState<Photo | null>(null);
  const [b, setB] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const votedKey = useMemo(() => (weekStart ? `lgfc_voted_${weekStart}` : ''), [weekStart]);
  const hasVoted = useMemo(() => {
    if (!votedKey) return false;
    try { return window.localStorage.getItem(votedKey) === '1'; } catch { return false; }
  }, [votedKey]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch('/api/matchup/current');
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to load matchup.');
        if (!alive) return;

        setWeekStart(String(data.week_start || ''));
        setA(data.photos?.a || null);
        setB(data.photos?.b || null);
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

  async function vote(choice: 'a' | 'b') {
    if (!weekStart || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/matchup/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_start: weekStart, choice }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Vote failed.');

      try { window.localStorage.setItem(votedKey, '1'); } catch {}
      router.push('/weeklyvote');
    } catch (e: unknown) {
      setErr(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <h2 className="section-title">Weekly Photo Matchup — Vote for your favorite</h2>
      <p className="sub">Vote is limited to one per device per week.</p>

      {loading ? (
        <p className="sub">Loading…</p>
      ) : err ? (
        <p className="sub">Error: {err}</p>
      ) : !a || !b ? (
        <p className="sub">Not enough photos in D1 yet to show a matchup.</p>
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[{ key: 'a', photo: a }, { key: 'b', photo: b }].map((item) => (
              <div key={item.key} className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.photo.url} alt={item.photo.description || item.photo.title || `Photo ${item.photo.id}`} className="photo" />
                <div className="card-body">
                  <div className="small">Photo #{item.photo.id}</div>
                  <div className="card-title">{item.photo.title || '—'}</div>
                  <div className="sub">{item.photo.description || ''}</div>
                  <button
                    type="button"
                    disabled={busy || hasVoted}
                    className="btn"
                    onClick={() => vote(item.key as 'a' | 'b')}
                    style={{ marginTop: 10 }}
                  >
                    {hasVoted ? 'Vote submitted' : (busy ? 'Submitting…' : 'Vote')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasVoted ? (
            <div style={{ marginTop: 10 }}>
              <Link href="/weeklyvote" className="sub" style={{ textDecoration: 'underline' }}>
                View this week’s results
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
