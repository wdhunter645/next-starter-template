'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './CalendarSection.module.css';

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

function splitIntoTwoColumns<T>(items: T[]): { left: T[]; right: T[] } {
  const mid = Math.ceil(items.length / 2);
  return { left: items.slice(0, mid), right: items.slice(mid) };
}

export default function CalendarSection() {
  const [items, setItems] = useState<EventRow[]>([]);
  const [status, setStatus] = useState<string>('Loading events…');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch('/api/events/next?limit=10', { cache: 'no-store' });
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

  const cols = useMemo(() => splitIntoTwoColumns(items), [items]);

  const renderList = (rows: EventRow[]) => (
    <ul className={styles.list}>
      {rows.map((e) => (
        <li key={e.id} className={styles.item}>
          <div className={styles.itemTitle}>{e.title}</div>

          <div className={styles.itemMeta}>
            {e.start_date}
            {e.end_date && e.end_date !== e.start_date ? ` → ${e.end_date}` : ''}
            {e.location ? ` • ${e.location}` : ''}
            {e.host ? ` • Host: ${e.host}` : ''}
            {e.fees ? ` • ${e.fees}` : ''}
          </div>

          {e.description ? <div className={styles.itemDesc}>{e.description}</div> : null}

          {e.external_url ? (
            <div className={styles.itemLinkWrap}>
              <a href={e.external_url} target="_blank" rel="noreferrer" className={styles.itemLink}>
                Details
              </a>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <section className={styles.calendar} aria-label="Fan Club Events Calendar">
      <h2 className={styles.title}>Fan Club Events Calendar</h2>

      {status ? (
        <p className={styles.status}>{status}</p>
      ) : items.length <= 1 ? (
        <div className={styles.columnsSingle}>{renderList(items)}</div>
      ) : (
        <div className={styles.columns} aria-label="Upcoming events">
          <div>{renderList(cols.left)}</div>
          <div>{renderList(cols.right)}</div>
        </div>
      )}
    </section>
  );
}
