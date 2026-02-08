'use client';

import React, { useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';

type JoinRequest = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  message?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  screen_name?: string | null;
  email_opt_in: number;
  profile_photo_id?: number | null;
  presence_status: string;
  presence_updated_at?: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export default function AdminJoinRequestsPage() {
  const [items, setItems] = useState<JoinRequest[]>([]);
  const [status, setStatus] = useState<string>('Loading…');

  useEffect(() => {
    (async () => {
      setStatus('Loading…');
      const res = await fetch('/api/admin/join-requests/list?limit=200', { cache: 'no-store' });
      const data: unknown = await res.json().catch(() => ({}));

      if (!isRecord(data) || data.ok !== true || !Array.isArray((data as any).items)) {
        setItems([]);
        setStatus('No data (or not authorized).');
        return;
      }

      setItems((data as any).items as JoinRequest[]);
      setStatus('');
    })().catch(() => {
      setItems([]);
      setStatus('Error loading join requests.');
    });
  }, []);

  return (
    <PageShell title="Join Requests" subtitle="Newest requests from join_requests">
      <AdminNav />
      {status ? <p style={{ marginTop: 12, opacity: 0.85 }}>{status}</p> : null}

      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['id','created_at','name','email','screen_name','message','email_opt_in','presence_status'].map((h) => (
                <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px', fontSize: 13 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.id}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.created_at}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.name}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.email}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.screen_name ?? ''}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13, maxWidth: 420 }}>
                  {(r.message ?? '').slice(0, 240)}
                </td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.email_opt_in ? 'yes' : 'no'}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.presence_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
