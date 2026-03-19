'use client';

import { useEffect, useState, type CSSProperties } from 'react';
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

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 16,
  alignItems: 'start',
};

const photoFrameStyle: CSSProperties = {
  width: '100%',
  height: 440,
  borderRadius: 12,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f3f4f6',
};

const photoStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center',
  display: 'block',
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

    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        setLoading(false);
      }
    }, 10000);

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

  const hasMatchup = !loading && !err && items.length >= 2;

  return (
    <div className="card">
      <h2 className="title-lgfc" style={{ marginTop: 24 }}>Weekly Photo Matchup. Vote for your favorite!</h2>

      {loading && <div style={{ paddingTop: 12 }}>Loading matchup…</div>}
      {!loading && err && <div style={{ paddingTop: 12 }}>{err}</div>}
      {!loading && !err && items.length < 2 && <div style={{ paddingTop: 12 }}>No matchup available this week.</div>}

      {hasMatchup && renderMatchupBody(items, hasVoted, submitting, totals, lastWeek, submit)}
    </div>
  );
}

function renderMatchupBody(
  items: { id: number; url: string; description?: string; title?: string }[],
  hasVoted: boolean,
  submitting: boolean,
  totals: { a: number; b: number } | null,
  lastWeek: { week_start: string; totals: { a: number; b: number }; winner: 'a' | 'b' | 'tie' } | null,
  submit: (choice: 'a' | 'b') => void,
) {
  const a = items[0];
  const b = items[1];

  return (
    <>
      <div style={gridStyle}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={photoFrameStyle}>
            <img
              src={a.url}
              alt={a.description || 'Lou Gehrig'}
              style={photoStyle}
            />
          </div>

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
          <div style={photoFrameStyle}>
            <img
              src={b.url}
              alt={b.description || 'Lou Gehrig'}
              style={photoStyle}
            />
          </div>

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
    </>
  );
}
