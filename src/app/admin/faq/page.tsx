'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  approved: boolean;
  pinned: boolean;
  views: number;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function asNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function asBool(v: unknown): boolean | null {
  return typeof v === 'boolean' ? v : null;
}

function normalize(raw: unknown): FaqItem | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id) ?? asString(raw.uuid) ?? asString(raw.faq_id) ?? null;
  const question = asString(raw.question) ?? null;
  const answer = asString(raw.answer) ?? '';
  if (!id || !question) return null;

  const approved =
    asBool(raw.approved) ??
    (asNumber(raw.approved) !== null ? (asNumber(raw.approved) as number) !== 0 : false);

  const pinned =
    asBool(raw.pinned) ??
    (asNumber(raw.pinned) !== null ? (asNumber(raw.pinned) as number) !== 0 : false);

  const views = asNumber(raw.views) ?? 0;

  return { id, question, answer, approved, pinned, views };
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function persistToken(t: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('lgfc_admin_token', t);
}

export default function AdminFaqPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<string>('');
  const [items, setItems] = useState<FaqItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    setToken(getToken());
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'approved') return items.filter((x) => x.approved);
    if (filter === 'pending') return items.filter((x) => !x.approved);
    return items;
  }, [items, filter]);

  async function load() {
    if (!token) {
      setStatus('Enter ADMIN_TOKEN to load FAQ.');
      return;
    }
    setStatus('Loading…');
    const res = await fetch('/api/admin/faq/list', {
      headers: { 'x-admin-token': token },
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
    const normalized = arr.map(normalize).filter((x): x is FaqItem => x !== null);
    setItems(normalized);
    setStatus('');
  }

  async function patch(id: string, changes: Partial<Pick<FaqItem, 'approved' | 'pinned'>>) {
    if (!token) return;
    setStatus('Saving…');
    const res = await fetch('/api/admin/faq/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ id, ...changes }),
    });
    const data: unknown = await res.json().catch(() => ({}));
    if (!isRecord(data) || data.ok !== true) {
      const err = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
      setStatus(`Error: ${err}`);
      return;
    }
    await load();
    setStatus('');
  }

  async function bumpView(id: string) {
    if (!token) return;
    await fetch('/api/admin/faq/bump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ id }),
    }).catch(() => {});
    await load();
  }

  return (
    <PageShell title="Admin • FAQ" subtitle="Approve, pin, and manage FAQ questions">
      <AdminNav />

      <div style={{ display: 'grid', gap: 12, maxWidth: 980 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontWeight: 600 }}>ADMIN_TOKEN</span>
          <input
            value={token}
            onChange={(e) => {
              const v = e.target.value;
              setToken(v);
              persistToken(v);
            }}
            placeholder="Paste ADMIN_TOKEN (stored locally in this browser)"
            style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />
        </label>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => void load()}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}
          >
            Load FAQ
          </button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'approved' | 'pending')}
            style={{ padding: 10, borderRadius: 10 }}
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          {status ? <span style={{ opacity: 0.85 }}>{status}</span> : null}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map((f) => (
            <div key={f.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 800 }}>{f.question}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ opacity: 0.75, fontSize: 13 }}>Views: {f.views}</span>
                  <button
                    onClick={() => void bumpView(f.id)}
                    style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}
                  >
                    +1 View
                  </button>
                </div>
              </div>

              {f.answer ? <div style={{ marginTop: 10, lineHeight: 1.35, opacity: 0.95 }}>{f.answer}</div> : null}

              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => void patch(f.id, { approved: !f.approved })}
                  style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}
                >
                  {f.approved ? 'Unapprove' : 'Approve'}
                </button>

                <button
                  onClick={() => void patch(f.id, { pinned: !f.pinned })}
                  style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}
                >
                  {f.pinned ? 'Unpin' : 'Pin'}
                </button>

                <span style={{ opacity: 0.75, alignSelf: 'center' }}>
                  Status: {f.approved ? 'Approved' : 'Pending'} • {f.pinned ? 'Pinned' : 'Not pinned'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
