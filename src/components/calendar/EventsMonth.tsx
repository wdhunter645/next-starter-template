'use client';

import React, { useEffect, useMemo, useState } from 'react';

type CalendarEvent = {
  id: string;
  title: string;
  starts_at: string; // ISO
  ends_at?: string | null; // ISO
  location?: string | null;
  description?: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function normalizeEvent(raw: unknown): CalendarEvent | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id) ?? asString(raw.event_id) ?? asString(raw.uuid) ?? null;
  const title = asString(raw.title) ?? asString(raw.name) ?? null;
  const starts_at = asString(raw.starts_at) ?? asString(raw.start) ?? asString(raw.start_time) ?? null;
  if (!id || !title || !starts_at) return null;
  const ends_at = asString(raw.ends_at) ?? asString(raw.end) ?? asString(raw.end_time);
  const location = asString(raw.location);
  const description = asString(raw.description);
  return { id, title, starts_at, ends_at, location, description };
}

export default function EventsMonth() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [status, setStatus] = useState<string>('');

  async function load(y: number, m: number) {
    setStatus('Loading events…');
    const res = await fetch(
      `/api/events/month?year=${encodeURIComponent(String(y))}&month=${encodeURIComponent(String(m))}`,
      { cache: 'no-store' }
    );

    const data: unknown = await res.json().catch(() => ({}));
    if (!isRecord(data) || data.ok !== true) {
      const err = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
      setStatus(`Error: ${err}`);
      setEvents([]);
      return;
    }

    const itemsRaw = (data as Record<string, unknown>).items;
    const arr = Array.isArray(itemsRaw) ? itemsRaw : [];
    const normalized = arr.map(normalizeEvent).filter((x): x is CalendarEvent => x !== null);
    setEvents(normalized);
    setStatus(normalized.length ? '' : 'No events found for this month.');
  }

  useEffect(() => {
    void load(year, month);
  }, [year, month]);

  function prevMonth() {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  function nextMonth() {
    const d = new Date(year, month, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  return (
    <div style={{ marginTop: 14, border: '1px solid #ddd', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700 }}>Events</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={prevMonth} style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}>
            Prev
          </button>
          <span style={{ fontWeight: 600 }}>
            {year}-{String(month).padStart(2, '0')}
          </span>
          <button onClick={nextMonth} style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}>
            Next
          </button>
        </div>
      </div>

      {status ? <p style={{ marginTop: 10, opacity: 0.85 }}>{status}</p> : null}

      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {events.map((e) => (
          <div key={e.id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{e.title}</div>
            <div style={{ opacity: 0.8, marginTop: 4, fontSize: 13 }}>
              {new Date(e.starts_at).toLocaleString()}
              {e.ends_at ? ` — ${new Date(e.ends_at).toLocaleString()}` : ''}
              {e.location ? ` • ${e.location}` : ''}
            </div>
            {e.description ? <div style={{ marginTop: 8, lineHeight: 1.35 }}>{e.description}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
