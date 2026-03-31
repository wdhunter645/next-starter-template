'use client';

import React, { useEffect, useState } from "react";
import { useMemberSession } from '@/hooks/useMemberSession';
import { buildFanclubPhotoListApiUrl } from '@/lib/fanclubApi';

type PhotoItem = { id: number; url: string; description?: string | null };

export default function PhotosPage() {
  const { isLoading, isAuthenticated } = useMemberSession({ redirectTo: '/' });
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 24;

  async function load(nextOffset: number) {
    setLoading(true);
    try {
      const res = await fetch(buildFanclubPhotoListApiUrl({ limit, offset: nextOffset, memorabilia: true }));
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        const incoming = Array.isArray(data.items) ? data.items : [];
        if (nextOffset === 0) setItems(incoming);
        else setItems((prev) => [...prev, ...incoming]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      load(0);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main>
      <h1>Memorabilia</h1>

      <div>
        {items.map((p) => (
          <div key={p.id}>
            {p.url ? <img src={p.url} alt="" /> : <span>No URL</span>}
            <div>{p.description || ''}</div>
          </div>
        ))}
      </div>

      <button
        disabled={loading}
        onClick={() => {
          const next = offset + limit;
          setOffset(next);
          load(next);
        }}
      >
        Load more
      </button>
    </main>
  );
}
