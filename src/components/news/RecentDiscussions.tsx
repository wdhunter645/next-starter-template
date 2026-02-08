'use client';

import React, { useEffect, useState } from 'react';

type Discussion = {
  id: string;
  title: string;
  href: string;
  created_at?: string | null;
};

type RecentDiscussionsProps = {
  limit?: number;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function normalize(raw: unknown): Discussion | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id) ?? asString(raw.uuid) ?? asString(raw.discussion_id) ?? null;
  const title = asString(raw.title) ?? asString(raw.subject) ?? null;
  const href = asString(raw.href) ?? asString(raw.url) ?? null;
  if (!id || !title || !href) return null;
  const created_at = asString(raw.created_at) ?? asString(raw.created);
  return { id, title, href, created_at };
}

export default function RecentDiscussions({ limit = 6 }: RecentDiscussionsProps) {
  const [items, setItems] = useState<Discussion[]>([]);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    (async () => {
      setStatus('Loading…');
      const res = await fetch('/api/discussions/list', { cache: 'no-store' });
      const data: unknown = await res.json().catch(() => ({}));
      if (!isRecord(data) || data.ok !== true) {
        const err = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
        setStatus(`Error: ${err}`);
        setItems([]);
        return;
      }
      const raw = (data as Record<string, unknown>).items;
      const arr = Array.isArray(raw) ? raw : [];
      const normalized = arr.map(normalize).filter((x): x is Discussion => x !== null);

      const limited = Number.isFinite(limit) && limit > 0 ? normalized.slice(0, limit) : normalized;

      setItems(limited);
      setStatus(limited.length ? '' : 'No discussions found.');
    })().catch(() => {
      setStatus('Error loading discussions.');
      setItems([]);
    });
  }, [limit]);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
        <div style={{ fontWeight: 700 }}>Recent Discussions</div>
        <a href="/ask" style={{ textDecoration: 'underline' }}>
          Ask a Question
        </a>
      </div>

      {status ? <p style={{ marginTop: 10, opacity: 0.85 }}>{status}</p> : null}

      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {items.map((d) => (
          <a key={d.id} href={d.href} style={{ display: 'block', border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{d.title}</div>
            <div style={{ opacity: 0.75, marginTop: 4, fontSize: 13 }}>
              {d.created_at ? new Date(d.created_at).toLocaleString() : ''}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
