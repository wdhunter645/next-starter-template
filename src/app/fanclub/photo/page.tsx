'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';
import { buildFanclubPhotoListApiUrl } from '@/lib/fanclubApi';
import { fanclubThreeColumnGridClassName } from '@/components/fanclub/fanclubGridStyles';

type PhotoItem = {
  id: number;
  url?: string;
  thumbnail_url?: string;
  title?: string | null;
  description?: string;
  tags?: string | null;
  uploaded_by?: string | null;
};

const pillBase: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(255,255,255,0.06)',
  cursor: 'pointer',
  fontSize: 13,
};

const pillActive: React.CSSProperties = {
  ...pillBase,
  background: '#1e3a8a',
  borderColor: '#1e3a8a',
  color: '#fff',
};

export default function FanclubPhotoGalleryPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [submittedTags, setSubmittedTags] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { isLoading, isAuthenticated } = useMemberSession({ redirectTo: '/' });

  const loadTags = useCallback(async () => {
    try {
      const res = await fetch('/api/fanclub/photos/tags', { credentials: 'include', cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.ok && Array.isArray(json.tags)) {
        setAvailableTags(json.tags.filter((tag: unknown) => typeof tag === 'string' && tag.trim()));
      }
    } catch {
      setAvailableTags([]);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(buildFanclubPhotoListApiUrl({ limit: 60, q: submittedQuery, tags: submittedTags }), {
        credentials: 'include',
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'list_failed');
      setItems(json.items || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [submittedQuery, submittedTags]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      loadTags();
    }
  }, [isLoading, isAuthenticated, loadTags]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      load();
    }
  }, [isLoading, isAuthenticated, load, refreshKey]);

  const tagCsv = useMemo(() => selectedTags.join(','), [selectedTags]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
      <h1 style={{ fontSize: 32, margin: '0 0 8px 0' }}>Photo Gallery</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Browse member-only photos. Use search and tags to narrow the archive.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query);
          setSubmittedTags(tagCsv);
          setRefreshKey((value) => value + 1);
        }}
        style={{ marginTop: 14, padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.14)' }}
      >
        <label style={{ display: 'grid', gap: 6 }}>
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search photos…"
            style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.2)' }}
          />
        </label>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>Tag filters</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              aria-pressed={selectedTags.length === 0}
              style={selectedTags.length === 0 ? pillActive : pillBase}
              onClick={() => setSelectedTags([])}
            >
              All
            </button>
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  style={active ? pillActive : pillBase}
                  onClick={() => {
                    setSelectedTags((current) =>
                      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag],
                    );
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <button
            type="submit"
            style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}
          >
            Apply filters
          </button>
        </div>
      </form>

      {loading && <p style={{ opacity: 0.85 }}>Loading…</p>}
      {err && <p style={{ color: 'salmon' }}>Unable to load member photos right now. {err}</p>}

      {!loading && !err && (
        <div className={fanclubThreeColumnGridClassName} style={{ marginTop: 14 }}>
          {items.map((p) => {
            const photoUrl = p.thumbnail_url || p.url;
            const title = p.title || p.description || `Photo #${p.id}`;

            return (
              <div key={p.id} style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ opacity: 0.75, fontSize: 12, padding: 10 }}>Photo media unavailable</span>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{title}</div>
                  {p.description && p.description !== title ? <p style={{ margin: '8px 0 0', opacity: 0.85 }}>{p.description}</p> : null}
                  {p.tags ? <div style={{ marginTop: 8, opacity: 0.72, fontSize: 12 }}>Tags: {p.tags}</div> : null}
                  {p.uploaded_by ? <div style={{ marginTop: 6, opacity: 0.72, fontSize: 12 }}>Source: {p.uploaded_by}</div> : null}
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', opacity: 0.85 }}>
              No photos match your search.
            </div>
          )}
        </div>
      )}

      <p style={{ marginTop: 18, opacity: 0.9 }}>
        Have a photo to share?{' '}
        <Link href="/fanclub/submit" style={{ fontWeight: 600 }}>
          Submit a Photo →
        </Link>
      </p>
    </main>
  );
}
