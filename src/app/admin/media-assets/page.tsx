'use client';

import React, { useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';

type Row = { id: number; media_uid: string; b2_key: string; b2_file_id?: string | null; size: number; etag?: string | null; ingested_at: string };

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export default function AdminMediaAssetsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>('Loading…');

  useEffect(() => {
    (async () => {
      try {
        setStatus('Loading…');
        const token = getToken();
        const res = await fetch('/api/admin/media-assets/list?limit=100', {
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
        const arr = Array.isArray((data as any).items) ? (data as any).items : [];
        setItems(arr as Row[]);
        setStatus(arr.length ? '' : 'No media assets found.');
      } catch (e: any) {
        setStatus(`Error: ${String(e?.message || e)}`);
        setItems([]);
      }
    })();
  }, []);

  return (
    <PageShell title="Media Assets" subtitle="Files ingested from Backblaze B2 (D1 media_assets)">
      <AdminNav />
      {status ? <p style={{ marginTop: 14, opacity: 0.85 }}>{status}</p> : null}

      <div style={{ overflowX: 'auto', marginTop: 14, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['id','media_uid','b2_key','size','ingested_at'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.15)', background: 'rgba(0,0,0,0.03)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>{r.id}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>{r.media_uid}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>{r.b2_key}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>{r.size}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>{r.ingested_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
