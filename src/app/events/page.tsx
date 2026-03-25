'use client';

import { useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';

type EventRow = {
  id: number;
  title: string;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  host?: string | null;
  fees?: string | null;
  description?: string | null;
  external_url?: string | null;
};

export default function EventsPage() {
  const [items, setItems] = useState<EventRow[]>([]);
  const [status, setStatus] = useState<string>('Loading events…');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch('/api/events/next?limit=50', { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        if (!alive) return;

        if (!res.ok || !data?.ok) {
          setStatus('Error loading events.');
          setItems([]);
          return;
        }

        const rows: EventRow[] = Array.isArray(data.items) ? data.items : [];
        setItems(rows);
        setStatus(rows.length ? '' : 'No upcoming events posted yet.');
      } catch {
        if (!alive) return;
        setStatus('Error loading events.');
        setItems([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <PageShell title="Upcoming Events" subtitle="Fan Club events and activities">
      {status ? (
        <p style={{ color: 'rgba(0,0,0,0.6)', margin: 0 }}>{status}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((e) => (
            <li
              key={e.id}
              style={{
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                padding: '16px 0',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16 }}>{e.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', marginTop: 4 }}>
                {e.start_date}
                {e.end_date && e.end_date !== e.start_date ? ` → ${e.end_date}` : ''}
                {e.location ? ` • ${e.location}` : ''}
                {e.host ? ` • Host: ${e.host}` : ''}
                {e.fees ? ` • ${e.fees}` : ''}
              </div>
              {e.description ? (
                <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.75)', margin: '6px 0 0' }}>
                  {e.description}
                </p>
              ) : null}
              {e.external_url ? (
                <a
                  href={e.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', fontSize: 14, marginTop: 6 }}
                >
                  Details ↗
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
