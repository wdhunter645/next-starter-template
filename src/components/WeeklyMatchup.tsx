'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

type Photo = {
  id: number;
  url: string;
  description?: string;
  title?: string;
};

type CurrentResp = {
  ok: boolean;
  week_start?: string;
  matchup_id?: number;
  items: Photo[];
};

type VoteResp = {
  ok: boolean;
  week_start: string;
  choice: 'a' | 'b';
  already_voted: boolean;
  totals: { a: number; b: number };
};

type ResultsResp = {
  ok: boolean;
  week_start: string | null;
  totals: { a: number; b: number };
  last_week: null | { week_start: string; totals: { a: number; b: number }; winner: 'a' | 'b' | 'tie' };
};

export default function WeeklyMatchup() {
  const [items, setItems] = useState<Photo[]>([]);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [hasVoted, setHasVoted] = useState(false);
  const [totals, setTotals] = useState<{ a: number; b: number } | null>(null);
  const [lastWeek, setLastWeek] = useState<ResultsResp['last_week']>(null);

  useEffect(() => {
    async function load() {
      try {
        setErr(null);
        setLoading(true);

        const data = await apiGet<CurrentResp>('/api/matchup/current');
        const gotWeek = data.week_start ?? null;

        setWeekStart(gotWeek);
        setItems((data.items ?? []).slice(0, 2));

        if (gotWeek) {
          const voted = window.localStorage.getItem(`lgfc_weekly_vote_${gotWeek}`) === '1';
          setHasVoted(voted);

          if (voted) {
            const r = await apiGet<ResultsResp>(`/api/matchup/results?week_start=${encodeURIComponent(gotWeek)}`);
            setTotals(r.totals);
            setLastWeek(r.last_week);
          }
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        setErr(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    
    // Set a timeout to prevent infinite loading
    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        setLoading(false);
        }
    }, 10000); // 10 second timeout

    load().finally(() => {
      completed = true;
      clearTimeout(timer);
    });
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  async function submit(choice: 'a' | 'b') {
    if (!weekStart) return;
    try {
      setSubmitting(true);
      setErr(null);

      const r = await apiPost<VoteResp>('/api/matchup/vote', { week_start: weekStart, choice });
      // Reveal results after vote (or if already voted server-side)
      window.localStorage.setItem(`lgfc_weekly_vote_${weekStart}`, '1');
      setHasVoted(true);
      setTotals(r.totals);

      const rr = await apiGet<ResultsResp>(`/api/matchup/results?week_start=${encodeURIComponent(weekStart)}`);
      setLastWeek(rr.last_week);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setErr(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <>
  <h2 className="title-lgfc">Weekly Photo Matchup. Vote for your favorite!</h2>
      <div className="card">Loading matchup…</div>
    </>
  );
  if (err) return (
    <>
  <h2 className="title-lgfc">Weekly Photo Matchup. Vote for your favorite!</h2>
    </>
  );
  if (items.length < 2) return (
    <>
  <h2 className="title-lgfc">Weekly Photo Matchup. Vote for your favorite!</h2>
    </>
  );

  const a = items[0];
  const b = items[1];

  return (
    <>
  <h2 className="title-lgfc">Weekly Photo Matchup. Vote for your favorite!</h2>
      <div className="card">
      <div className="grid">
        <div className="card" style={{ textAlign: 'center' }}>
          <img src={a.url} alt={a.description || 'Lou Gehrig'} style={{ width: '100%', borderRadius: 12 }} />
          <div className="sub" style={{ marginTop: 10 }}>{a.title || a.description || 'Photo A'}</div>
          {!hasVoted && (
            <button
              disabled={submitting}
              onClick={() => submit('a')}
              className="btn"
              style={{ marginTop: 12, width: '100%' }}
            >
              {submitting ? 'Submitting…' : 'Vote A'}
            </button>
          )}
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <img src={b.url} alt={b.description || 'Lou Gehrig'} style={{ width: '100%', borderRadius: 12 }} />
          <div className="sub" style={{ marginTop: 10 }}>{b.title || b.description || 'Photo B'}</div>
          {!hasVoted && (
            <button
              disabled={submitting}
              onClick={() => submit('b')}
              className="btn"
              style={{ marginTop: 12, width: '100%' }}
            >
              {submitting ? 'Submitting…' : 'Vote B'}
            </button>
          )}
        </div>
      </div>

      {hasVoted && totals && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 800, color: 'var(--lgfc-blue)' }}>Results (revealed)</div>
          <div className="sub" style={{ marginTop: 6 }}>A: {totals.a} · B: {totals.b}</div>
          {lastWeek && (
            <div className="sub" style={{ marginTop: 10, opacity: 0.85 }}>
              Last closed week ({lastWeek.week_start}): A {lastWeek.totals.a} · B {lastWeek.totals.b} · Winner: {lastWeek.winner.toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
