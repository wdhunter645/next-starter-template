'use client';

import { useEffect, useState } from 'react';

type ReportItem = {
  id: number;
  kind: string;
  target_id: number;
  reporter_email?: string;
  reason?: string;
  status: string;
  admin_note?: string;
  created_at: string;
  resolved_at?: string;
};

export default function AdminModerationPage() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      const res = await fetch('/api/admin/reports/list?status=open&limit=200', { cache: 'no-store' });
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

  async function close(id: number) {
    const note = window.prompt('Admin note (optional):') || '';
    setMsg('');
    try {
      const res = await fetch('/api/admin/reports/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_note: note }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'close_failed');
      setMsg(`Closed report #${id}`);
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setMsg(`Error: ${msg}`);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
      <h1 style={{ fontSize: 32, margin: '0 0 8px 0' }}>Admin Moderation Queue</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Open reports across discussions/photos/library. Close a report after review.
      </p>

      <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
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
          {items.map((r) => (
            <div key={r.id} style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <div style={{ fontWeight: 700 }}>#{r.id}</div>
                <div style={{ opacity: 0.85 }}>{r.kind} → {r.target_id}</div>
                <div style={{ marginLeft: 'auto', opacity: 0.75, fontSize: 12 }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div style={{ marginTop: 8, opacity: 0.92, whiteSpace: 'pre-wrap' }}>{r.reason}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                <button
                  onClick={() => close(r.id)}
                  style={{ padding: '7px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', opacity: 0.85 }}>
              No open reports.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
