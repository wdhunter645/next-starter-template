'use client';

import { useEffect, useState } from 'react';

type EventItem = {
  id: number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
};

export default function AdminEventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      // Reuse public listing for now (admin create/edit uses admin endpoints).
      const res = await fetch('/api/events/month?month=' + new Date().toISOString().slice(0,7), { cache: 'no-store' });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'list_failed');
      setItems(json.items || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    const title = window.prompt('Event title:') || '';
    const date = window.prompt('Event date (YYYY-MM-DD):') || '';
    if (title.trim().length < 3 || date.trim().length < 10) return;

    const time = window.prompt('Time (optional):') || '';
    const location = window.prompt('Location (optional):') || '';
    const description = window.prompt('Description (optional):') || '';

    setMsg('');
    try {
      const res = await fetch('/api/admin/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, time, location, description }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'create_failed');
      setMsg('Created.');
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setMsg('Error: ' + msg);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
      <h1 style={{ fontSize: 32, margin: '0 0 8px 0' }}>Admin Events</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Create/edit events that appear on the public calendar.
      </p>

      <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={create}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}
        >
          Create event
        </button>
        <button
          onClick={load}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', cursor: 'pointer' }}
        >
          Refresh
        </button>
        {msg && <div style={{ marginLeft: 'auto', opacity: 0.9 }}>{msg}</div>}
      </div>

      {loading && <p style={{ opacity: 0.85 }}>Loading…</p>}
      {err && <p style={{ color: 'salmon' }}>Error: {err}</p>}

      {!loading && !err && (
        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          {items.map((it) => (
            <div key={it.id} style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <div style={{ fontWeight: 700 }}>{it.title}</div>
                <div style={{ marginLeft: 'auto', opacity: 0.75, fontSize: 12 }}>{it.date}{it.time ? ` ${it.time}` : ''}</div>
              </div>
              {(it.location || it.description) && (
                <div style={{ marginTop: 8, opacity: 0.9 }}>
                  {it.location && <div><strong>Location:</strong> {it.location}</div>}
                  {it.description && <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{it.description}</div>}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', opacity: 0.85 }}>
              No events found.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
