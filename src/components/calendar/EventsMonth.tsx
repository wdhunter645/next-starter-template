'use client';

import React, { useEffect, useMemo, useState } from 'react';

type EventItem = {
  id: number;
  title: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  host: string | null;
  fees: string | null;
  description: string | null;
  external_url: string | null;
};

type ApiResponse = { ok: boolean; month?: string; items?: EventItem[]; error?: string };

function monthKeyNowUTC(): string {
  const d = new Date();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${d.getUTCFullYear()}-${m}`;
}

export default function EventsMonth() {
  const [month, setMonth] = useState(monthKeyNowUTC());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [items, setItems] = useState<EventItem[]>([]);

  const canPrev = true;

  const title = useMemo(() => {
    const [y, m] = month.split('-');
    const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }, [month]);

  const shiftMonth = (delta: number) => {
    const [y, m] = month.split('-').map(n => Number(n));
    const d = new Date(Date.UTC(y, (m - 1) + delta, 1));
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    setMonth(`${d.getUTCFullYear()}-${mm}`);
  };

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const res = await fetch(`/api/events/month?month=${encodeURIComponent(month)}`);
        const data = (await res.json()) as ApiResponse;
        if (!data.ok) throw new Error(data.error || 'Events load failed');
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
  }, [month]);

  return (
    <section style={{ marginTop: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Events – {title}</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => shiftMonth(-1)} style={btnStyle}>Prev</button>
          <button type="button" onClick={() => setMonth(monthKeyNowUTC())} style={btnStyle}>This month</button>
          <button type="button" onClick={() => shiftMonth(1)} style={btnStyle}>Next</button>
        </div>
      </div>

      {loading ? <p style={{ marginTop: 10 }}>Loading…</p> : null}
      {err ? <p style={{ marginTop: 10, color: '#b00020', fontWeight: 700 }}>{err}</p> : null}
      {!loading && !err && items.length === 0 ? (
        <p style={{ marginTop: 10, opacity: 0.9 }}>No posted events for this month yet.</p>
      ) : null}

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {items.map(ev => (
          <article key={ev.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{ev.title}</h3>
              <div style={{ fontSize: 13, opacity: 0.8, whiteSpace: 'nowrap' }}>
                {ev.start_date}{ev.end_date ? ` → ${ev.end_date}` : ''}
              </div>
            </div>

            {ev.location ? <div style={{ marginTop: 6, fontSize: 14 }}><strong>Location:</strong> {ev.location}</div> : null}
            {ev.host ? <div style={{ marginTop: 6, fontSize: 14 }}><strong>Host:</strong> {ev.host}</div> : null}
            {ev.fees ? <div style={{ marginTop: 6, fontSize: 14 }}><strong>Fees:</strong> {ev.fees}</div> : null}
            {ev.description ? <p style={{ margin: '10px 0 0 0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{ev.description}</p> : null}

            {ev.external_url ? (
              <p style={{ margin: '10px 0 0 0' }}>
                <a href={ev.external_url} target="_blank" rel="noreferrer" style={{ fontWeight: 800, textDecoration: 'none' }}>
                  Event link →
                </a>
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.22)',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
};

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 16,
  padding: 16,
  background: '#fff',
};
