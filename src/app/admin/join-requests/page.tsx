'use client';

import React, { useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';

type JoinRequest = {
  id: number;
  name: string;
  email: string;
  message?: string | null;
  created_at?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  screen_name?: string | null;
  email_opt_in?: number | null;
  presence_status?: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

export default function AdminJoinRequestsPage() {
  const [status, setStatus] = useState<string>('');
  const [items, setItems] = useState<JoinRequest[]>([]);

  async function load() {
    setStatus('Loading…');
    const token = getToken();
    const res = await fetch('/api/admin/join-requests/list?limit=50', {
      headers: token ? { 'x-admin-token': token } : {},
      cache: 'no-store',
    });
    const data: unknown = await res.json().catch(() => ({}));

    if (!isRecord(data) || data.ok !== true) {
      const err = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
      setStatus(`Error: ${err}`);
      setItems([]);
      return;
    }

    const raw = (data as Record<string, unknown>).items;
    const arr = Array.isArray(raw) ? raw : [];
    const normalized: JoinRequest[] = arr
      .map((r) => (isRecord(r) ? (r as any) : null))
      .filter((x): x is JoinRequest => x !== null);

    setItems(normalized);
    setStatus(normalized.length ? '' : 'No join requests found.');
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <PageShell title="Join Requests" subtitle="Recent join requests captured from /join">
      <AdminNav />
      <div style={{ marginTop: 14 }}>
        <button
          onClick={() => void load()}
          style={{ border: '1px solid #ddd', borderRadius: 10, padding: '10px 12px', fontWeight: 700, cursor: 'pointer' }}
        >
          Refresh
        </button>

        {status ? <p style={{ marginTop: 10, opacity: 0.85 }}>{status}</p> : null}

        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {items.map((j) => (
            <div key={j.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 800 }}>{j.name}</div>
              <div style={{ opacity: 0.85, marginTop: 4 }}>{j.email}</div>
              <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>
                {j.created_at ? new Date(j.created_at).toLocaleString() : ''}
                {j.presence_status ? ` • ${j.presence_status}` : ''}
                {typeof j.email_opt_in === 'number' ? ` • opt-in: ${j.email_opt_in ? 'yes' : 'no'}` : ''}
              </div>
              {j.message ? <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{j.message}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
