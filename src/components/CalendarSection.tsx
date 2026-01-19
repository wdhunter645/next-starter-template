'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/lib/api';

type EventRow = {
  id: number;
  title: string;
  start_date: string;
  start_time?: string;
  location?: string;
  description?: string;
  external_url?: string;
};

function yyyymm(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function CalendarSection() {
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const month = useMemo(() => yyyymm(new Date()), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: EventRow[] }>(`/api/events/month?month=${encodeURIComponent(month)}`);
        if (alive) setItems(data.items || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [month]);

  return (
    <div>
      <h2 className="section-title">Events Calendar</h2>
      <p className="sub">Current month events pulled live from D1 events table.</p>

      {loading ? (
        <p className="sub">Loading…</p>
      ) : items.length === 0 ? (
        <p className="sub">No events yet for {month} (D1 table is empty).</p>
      ) : (
        <div className="grid">
          {items.map((e) => (
            <div key={e.id} className="card">
              <strong>{e.start_date}{e.start_time ? ` @ ${e.start_time}` : ''}</strong>
              <div style={{ marginTop: 6, fontWeight: 700 }}>{e.title}</div>
              {e.location ? <div className="sub" style={{ marginTop: 6 }}>{e.location}</div> : null}
              {e.description ? <div className="sub" style={{ marginTop: 10 }}>{e.description}</div> : null}
              {e.external_url ? (
                <div style={{ marginTop: 10 }}>
                  <a className="link" href={e.external_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Details</a>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
