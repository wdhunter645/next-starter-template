'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Discussion = {
  id: number;
  title: string;
  body: string;
  created_at: string;
};

type Props = {
  limit?: number;
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

function normalize(raw: unknown): Discussion | null {
  if (!isRecord(raw)) return null;
  const id = asNumber(raw.id);
  const title = asString(raw.title) ?? null;
  const body = asString(raw.body) ?? '';
  const created_at = asString(raw.created_at) ?? '';
  if (id === null || !title || !created_at) return null;
  return { id, title, body, created_at };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function RecentDiscussions({ limit = 6 }: Props) {
  const [items, setItems] = useState<Discussion[]>([]);
  const [status, setStatus] = useState<string>('Loading…');

  const safeLimit = useMemo(() => {
    const n = Number(limit);
    if (!Number.isFinite(n) || n <= 0) return 6;
    return Math.min(20, Math.max(1, Math.floor(n)));
  }, [limit]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setStatus('Loading…');
        const res = await fetch(`/api/discussions/list?limit=${safeLimit}`, { cache: 'no-store' });
        const data: unknown = await res.json().catch(() => ({}));

        if (!isRecord(data) || data.ok !== true) {
          const err = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
          if (alive) {
            setItems([]);
            setStatus(`Error: ${err}`);
          }
          return;
        }

        const raw = (data as Record<string, unknown>).items;
        const arr = Array.isArray(raw) ? raw : [];
        const normalized = arr.map(normalize).filter((x): x is Discussion => x !== null);

        if (!alive) return;
        setItems(normalized.slice(0, safeLimit));
        setStatus(normalized.length ? '' : 'No discussions yet.');
      } catch {
        if (!alive) return;
        setItems([]);
        setStatus('Error loading discussions.');
      }
    })();

    return () => {
      alive = false;
    };
  }, [safeLimit]);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
        <div style={{ fontWeight: 700 }}>Recent Discussions</div>
        <a href="/fanclub" style={{ textDecoration: 'underline' }}>
          Open FanClub
        </a>
      </div>

      {status ? <p style={{ marginTop: 10, opacity: 0.85 }}>{status}</p> : null}

      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {items.map((d) => (
          <a
            key={d.id}
            href="/fanclub"
            style={{
              display: 'block',
              border: '1px solid #eee',
              borderRadius: 10,
              padding: 12,
              textDecoration: 'none',
              color: 'inherit',
            }}
            aria-label={`Open FanClub discussions (recent: ${d.title})`}
            title={d.body}
          >
            <div style={{ fontWeight: 700 }}>{d.title}</div>
            <div style={{ opacity: 0.85, marginTop: 6, fontSize: 14, lineHeight: 1.4 }}>
              {d.body ? (d.body.length > 140 ? `${d.body.slice(0, 140)}…` : d.body) : ''}
            </div>
            <div style={{ opacity: 0.7, marginTop: 6, fontSize: 12 }}>{formatDate(d.created_at)}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
