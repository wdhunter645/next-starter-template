'use client';

import React, { useEffect, useMemo, useState } from 'react';

type CalendarEvent = {
  id: number;
  title: string;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
  location?: string | null;
  host?: string | null;
  fees?: string | null;
  description?: string | null;
  external_url?: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function normalizeEvent(raw: unknown): CalendarEvent | null {
  if (!isRecord(raw)) return null;
  const id = asNumber(raw.id);
  const title = asString(raw.title) ?? null;
  const start_date = asString(raw.start_date) ?? asString(raw.starts_at) ?? null;
  const end_date = asString(raw.end_date) ?? asString(raw.ends_at) ?? null;

  if (id === null || !title || !start_date) return null;

  return {
    id,
    title,
    start_date,
    end_date,
    location: asString(raw.location),
    host: asString(raw.host),
    fees: asString(raw.fees),
    description: asString(raw.description),
    external_url: asString(raw.external_url),
  };
}

function monthKeyFromParts(year: number, month: number): string {
  const y = String(year);
  const m = String(month).padStart(2, '0');
  return `${y}-${m}`;
}

export default function EventsMonth() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(now.getUTCFullYear());
  const [month, setMonth] = useState<number>(now.getUTCMonth() + 1); // 1-12
  const [items, setItems] = useState<CalendarEvent[]>([]);
  const [status, setStatus] = useState<string>('');

  const monthKey = useMemo(() => monthKeyFromParts(year, month), [year, month]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setStatus('Loading events…');
        const res = await fetch(`/api/events/month?month=${encodeURIComponent(monthKey)}`, { cache: 'no-store' });
        const data: unknown = await res.json().catch(() => ({}));

        if (!isRecord(data) || data.ok !== true) {
          const err = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
          if (alive) {
            setItems([]);
            setStatus(`Error: ${err}`);
          }
          return;
        }

        const raw = (data as Record<string, unknown>).items;
        const arr = Array.isArray(raw) ? raw : [];
        const normalized = arr.map(normalizeEvent).filter((x): x is CalendarEvent => x !== null);

        if (!alive) return;
        setItems(normalized);
        setStatus(normalized.length ? '' : 'No events posted for this month.');
      } catch {
        if (!alive) return;
        setItems([]);
        setStatus('Error loading events.');
      }
    })();

    return () => {
      alive = false;
    };
  }, [monthKey]);

  const goPrev = () => {
    setStatus('');
    setItems([]);
    setMonth((prev) => {
      if (prev > 1) return prev - 1;
      setYear((y) => y - 1);
      return 12;
    });
  };

  const goNext = () => {
    setStatus('');
    setItems([]);
    setMonth((prev) => {
      if (prev < 12) return prev + 1;
      setYear((y) => y + 1);
      return 1;
    });
  };

  return (
    <section style={{ border: '1px solid #eee', borderRadius: 14, padding: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Events — {monthKey}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={goPrev} style={btnStyle}>
            Prev
          </button>
          <button type="button" onClick={goNext} style={btnStyle}>
            Next
          </button>
        </div>
      </div>

      {status ? <p style={{ marginTop: 10, opacity: 0.85 }}>{status}</p> : null}

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {items.map((e) => (
          <article key={e.id} style={{ border: '1px solid #f0f0f0', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 800 }}>{e.title}</div>
              <div style={{ opacity: 0.75, fontSize: 13 }}>
                {e.start_date}{e.end_date ? ` → ${e.end_date}` : ''}
              </div>
            </div>

            {e.location ? <div style={{ marginTop: 6, opacity: 0.85 }}>Location: {e.location}</div> : null}
            {e.host ? <div style={{ marginTop: 4, opacity: 0.85 }}>Host: {e.host}</div> : null}
            {e.fees ? <div style={{ marginTop: 4, opacity: 0.85 }}>Fees: {e.fees}</div> : null}

            {e.description ? <p style={{ marginTop: 8, lineHeight: 1.55 }}>{e.description}</p> : null}

            {e.external_url ? (
              <p style={{ marginTop: 8 }}>
                <a href={e.external_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                  External link
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
  border: '1px solid #ddd',
  borderRadius: 10,
  padding: '8px 10px',
  background: 'white',
  cursor: 'pointer',
};
