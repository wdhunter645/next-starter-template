'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemberSession } from '@/hooks/useMemberSession';
import { buildFanclubPhotoListApiUrl } from '@/lib/fanclubApi';

type MemorabiliaItem = {
  id: number;
  thumbnail_url?: string | null;
  title?: string | null;
  description?: string | null;
  tags?: string | null;
};

type RelatedLibraryEntry = {
  id: number;
  title?: string | null;
  author?: string | null;
  summary?: string | null;
};

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '40px 16px', maxWidth: 1100, margin: '0 auto' },
  h1: { fontSize: 34, lineHeight: 1.15, margin: '0 0 12px 0' },
  lead: { fontSize: 18, lineHeight: 1.6, margin: '0 0 18px 0' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
  },
  card: { border: '1px solid rgba(0,0,0,0.15)', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.6)' },
  img: { width: '100%', height: 160, objectFit: 'cover', display: 'block' },
  cap: { padding: 10, fontSize: 13, lineHeight: 1.4, opacity: 0.9 },
  btnRow: { display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  btn: { padding: '10px 14px', fontSize: 16, borderRadius: 12, border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer', textDecoration: 'none', color: 'inherit' },
  related: { marginTop: 24, padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' },
};

export default function MemorabiliaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeQuery = searchParams.get('q') || '';
  const { isLoading, isAuthenticated } = useMemberSession({ redirectTo: '/' });
  const [items, setItems] = useState<MemorabiliaItem[]>([]);
  const [relatedEntries, setRelatedEntries] = useState<RelatedLibraryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [message, setMessage] = useState('');
  const [draftQuery, setDraftQuery] = useState(activeQuery);
  const limit = 24;

  useEffect(() => {
    setDraftQuery(activeQuery);
  }, [activeQuery]);

  async function load(nextOffset: number, q: string) {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(buildFanclubPhotoListApiUrl({ limit, offset: nextOffset, memorabilia: true, q }), {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        const incoming = Array.isArray(data.items) ? data.items : [];
        if (nextOffset === 0) setItems(incoming);
        else setItems((prev) => [...prev, ...incoming]);
        if (nextOffset === 0) {
          setRelatedEntries(Array.isArray(data.related_library_entries) ? data.related_library_entries : []);
        }
      } else if (nextOffset === 0) {
        setItems([]);
        setRelatedEntries([]);
        setMessage(data?.error || 'Unable to load memorabilia items right now.');
      }
    } catch {
      if (nextOffset === 0) {
        setItems([]);
        setRelatedEntries([]);
        setMessage('Unable to load memorabilia items right now.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setOffset(0);
      load(0, activeQuery);
    }
  }, [isLoading, isAuthenticated, activeQuery]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Memorabilia Archive</h1>
      <p style={{ ...styles.lead }}>A read-only view of memorabilia-tagged records sourced from the photo archive.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const next = draftQuery.trim();
          const params = new URLSearchParams();
          if (next) params.set('q', next);
          const suffix = params.toString();
          router.replace(suffix ? `/fanclub/memorabilia?${suffix}` : '/fanclub/memorabilia');
        }}
      >
        <label style={{ display: 'grid', gap: 6, fontSize: 14, marginBottom: 14 }}>
          Search
          <input
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)}
            placeholder="Search memorabilia…"
            style={{ padding: '10px 12px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)' }}
          />
        </label>
        <button type="submit" style={{ ...styles.btn, marginBottom: 14 }}>
          Search memorabilia
        </button>
      </form>
      {message ? <p style={{ opacity: 0.85 }}>{message}</p> : null}

      <div style={{ ...styles.grid }}>
        {items.map((p) => (
          <div key={p.id} style={{ ...styles.card }}>
            {p.thumbnail_url ? (
              <img src={p.thumbnail_url} alt={p.description || p.title || `Item ${p.id}`} style={{ ...styles.img }} />
            ) : (
              <div style={{ ...styles.img, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No image</div>
            )}
            <div style={{ ...styles.cap }}>
              <div>{p.title || p.description || '—'}</div>
              {p.tags ? <div style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>Tags: {p.tags}</div> : null}
            </div>
          </div>
        ))}
      </div>
      {!loading && items.length === 0 ? (
        <p style={{ marginTop: 14, opacity: 0.85 }}>
          {activeQuery.trim() ? 'No memorabilia items match your search.' : 'No memorabilia items found.'}
        </p>
      ) : null}

      {relatedEntries.length > 0 ? (
        <section style={styles.related} aria-label="Related library stories">
          <h2 style={{ margin: '0 0 10px 0', fontSize: 20 }}>Related stories</h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {relatedEntries.map((entry) => (
              <li key={entry.id} style={{ marginBottom: 10 }}>
                <strong>{entry.title || 'Untitled story'}</strong>
                {entry.author ? <span style={{ opacity: 0.8 }}> — {entry.author}</span> : null}
                {entry.summary ? <div style={{ opacity: 0.85, marginTop: 4 }}>{entry.summary}</div> : null}
              </li>
            ))}
          </ul>
          <Link href="/fanclub/library" style={{ ...styles.btn, display: 'inline-block', marginTop: 10 }}>
            Open Gehrig Library
          </Link>
        </section>
      ) : null}

      <div style={{ ...styles.btnRow }}>
        <button
          style={{ ...styles.btn }}
          disabled={loading}
          onClick={() => {
            const next = offset + limit;
            setOffset(next);
            load(next, activeQuery);
          }}
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
        <Link style={{ ...styles.btn }} href="/fanclub/photo">
          View photos
        </Link>
        <Link style={{ ...styles.btn }} href="/fanclub/library">
          View library
        </Link>
        <Link style={{ ...styles.btn }} href="/fanclub">
          Back to Fan Club Home
        </Link>
      </div>
    </main>
  );
}
