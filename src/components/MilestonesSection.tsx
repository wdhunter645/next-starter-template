'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Milestone = {
  id: number;
  year: number | null;
  date?: string | null;
  milestone_date?: string | null;
  title: string;
  description?: string | null;
  photo_url?: string | null;
};

const safeText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseDateRank = (m: Milestone): number | null => {
  const rawDate = safeText(m.milestone_date) ?? safeText(m.date);
  if (rawDate) {
    const parsed = Date.parse(rawDate);
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (typeof m.year === 'number' && Number.isFinite(m.year)) {
    return Date.UTC(m.year, 0, 1);
  }

  return null;
};

const compareMilestones = (a: Milestone, b: Milestone): number => {
  const aRank = parseDateRank(a);
  const bRank = parseDateRank(b);

  if (aRank === null && bRank === null) {
    return a.id - b.id;
  }
  if (aRank === null) return 1;
  if (bRank === null) return -1;
  if (aRank !== bRank) return aRank - bRank;
  return a.id - b.id;
};

export default function MilestonesSection() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Milestone[] }>(`/api/milestones/list?limit=40`);
        if (!alive) return;

        const normalized = Array.isArray(data.items)
          ? data.items.filter((m): m is Milestone => typeof m?.id === 'number' && typeof m?.title === 'string')
          : [];

        setItems([...normalized].sort(compareMilestones));
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <h2 className="section-title">Milestones</h2>
      <p className="sub">Pulled live from D1 milestones table.</p>

      {loading ? (
        <p className="sub">Loading milestones…</p>
      ) : items.length === 0 ? (
        <p className="sub">No milestones are available yet.</p>
      ) : (
        <div className="grid">
          {items.map((m) => {
            const safeTitle = safeText(m.title) ?? 'Untitled milestone';
            const safeDescription = safeText(m.description);
            const safePhotoUrl = safeText(m.photo_url);

            return (
              <div key={m.id} className="card">
                <strong>
                  {(m.year ?? '—')}: {safeTitle}
                </strong>
                {safePhotoUrl ? (
                  <div style={{ marginTop: 10 }}>
                    <img src={safePhotoUrl} alt={safeTitle} style={{ width: '100%', borderRadius: 12 }} />
                  </div>
                ) : null}
                {safeDescription ? <p className="sub" style={{ marginTop: 10 }}>{safeDescription}</p> : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
