'use client';

import React, { useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';

type Milestone = {
  id: string;
  title: string;
  date?: string | null;
  description?: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function normalize(raw: unknown): Milestone | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id) ?? asString(raw.uuid) ?? asString(raw.milestone_id) ?? null;
  const title = asString(raw.title) ?? asString(raw.name) ?? null;
  if (!id || !title) return null;
  const date = asString(raw.date) ?? asString(raw.happened_on);
  const description = asString(raw.description) ?? asString(raw.body);
  return { id, title, date, description };
}

export default function MilestonesPage() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [status, setStatus] = useState<string>('Loading…');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/milestones/list', { cache: 'no-store' });
      const data: unknown = await res.json().catch(() => ({}));
      if (!isRecord(data) || data.ok !== true) {
        const err = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
        setStatus(`Error: ${err}`);
        setItems([]);
        return;
      }
      const raw = (data as Record<string, unknown>).items;
      const arr = Array.isArray(raw) ? raw : [];
      const normalized = arr.map(normalize).filter((x): x is Milestone => x !== null);
      setItems(normalized);
      setStatus(normalized.length ? '' : 'No milestones found.');
    })().catch(() => {
      setStatus('Error loading milestones.');
      setItems([]);
    });
  }, []);

  return (
    <PageShell title="Milestones" subtitle="Lou Gehrig career highlights and fan club history">
      {status ? <p style={{ opacity: 0.85 }}>{status}</p> : null}

      <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
        {items.map((m) => (
          <div key={m.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 800 }}>{m.title}</div>
            {m.date ? <div style={{ opacity: 0.75, marginTop: 4 }}>{m.date}</div> : null}
            {m.description ? <div style={{ marginTop: 10, lineHeight: 1.35 }}>{m.description}</div> : null}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
