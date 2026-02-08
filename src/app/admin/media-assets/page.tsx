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
  ingested_at?: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}


function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function normalize(raw: unknown): MediaAsset | null {
  if (!isRecord(raw)) return null;

  const id = asNumber(raw.id);
  const media_uid = asString(raw.media_uid);
  const b2_key = asString(raw.b2_key);
  const size = asNumber(raw.size);

  if (id === null || !media_uid || !b2_key || size === null) return null;

  const b2_file_id = asString(raw.b2_file_id);
  const etag = asString(raw.etag);
  const ingested_at = asString(raw.ingested_at);

  return {
    id: Math.trunc(id),
    media_uid,
    b2_key,
    b2_file_id,
    size: Math.trunc(size),
    etag,
    ingested_at,
  };
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

export default function AdminMediaAssetsPage() {
  const [status, setStatus] = useState<string>('');
  const [items, setItems] = useState<MediaAsset[]>([]);

  async function load() {
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

    const raw = (data as Record<string, unknown>).items;
    const arr = Array.isArray(raw) ? raw : [];
    const normalized = arr.map(normalize).filter((x): x is MediaAsset => x !== null);

    setItems(normalized);
    setStatus(normalized.length ? '' : 'No media assets found.');
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <PageShell title="Media Assets" subtitle="D1 inventory of ingested media (B2 keys, size, etag)">
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
          {items.map((m) => (
            <div key={m.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 800 }}>{m.b2_key}</div>
              <div style={{ opacity: 0.85, marginTop: 4 }}>uid: {m.media_uid}</div>
              <div style={{ opacity: 0.85, marginTop: 4 }}>size: {m.size}</div>
              {m.etag ? <div style={{ opacity: 0.85, marginTop: 4 }}>etag: {m.etag}</div> : null}
              {m.b2_file_id ? <div style={{ opacity: 0.85, marginTop: 4 }}>b2_file_id: {m.b2_file_id}</div> : null}
              <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>
                {m.ingested_at ? new Date(m.ingested_at).toLocaleString() : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
