'use client';

import React, { useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';

type MediaAsset = {
  id: number;
  media_uid: string;
  b2_key: string;
  b2_file_id?: string | null;
  size: number;
  etag?: string | null;
  ingested_at: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export default function AdminMediaAssetsPage() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [status, setStatus] = useState<string>('Loading…');

  useEffect(() => {
    (async () => {
      setStatus('Loading…');
      const res = await fetch('/api/admin/media-assets/list?limit=200', { cache: 'no-store' });
      const data: unknown = await res.json().catch(() => ({}));

      if (!isRecord(data) || data.ok !== true || !Array.isArray((data as any).items)) {
        setItems([]);
        setStatus('No data (or not authorized).');
        return;
      }

      setItems((data as any).items as MediaAsset[]);
      setStatus('');
    })().catch(() => {
      setItems([]);
      setStatus('Error loading media assets.');
    });
  }, []);

  return (
    <PageShell title="Media Assets" subtitle="Rows from media_assets (Backblaze index)">
      <AdminNav />
      {status ? <p style={{ marginTop: 12, opacity: 0.85 }}>{status}</p> : null}

      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['id','ingested_at','media_uid','b2_key','b2_file_id','size','etag'].map((h) => (
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
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.ingested_at}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.media_uid}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.b2_key}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.b2_file_id ?? ''}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.size}</td>
                <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', fontSize: 13 }}>{r.etag ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
