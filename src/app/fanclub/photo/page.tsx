'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';
import { buildFanclubPhotoListApiUrl } from '@/lib/fanclubApi';
import { fanclubThreeColumnGridClassName } from '@/components/fanclub/fanclubGridStyles';
import styles from './page.module.css';

type PhotoItem = {
  id: number;
  url?: string;
  thumbnail_url?: string;
  title?: string | null;
  description?: string;
  tags?: string | null;
  uploaded_by?: string | null;
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
    <main className={styles.main}>
      <h1 className={styles.title}>Photo Gallery</h1>
      <p className={styles.lead}>Browse member-only photos. Use search and tags to narrow the archive.</p>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query);
          setSubmittedTags(tagCsv);
          setRefreshKey((value) => value + 1);
        }}
      >
        <label className={styles.field}>
          Search
          <input
            className={styles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search photos…"
            aria-label="Search photos"
          />
        </label>

        <div className={styles.tagBlock}>
          <div className={styles.tagLabel}>Tag filters</div>
          <div className={styles.pillRow}>
            <button
              type="button"
              aria-pressed={selectedTags.length === 0}
              className={selectedTags.length === 0 ? styles.pillActive : styles.pill}
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
                  className={active ? styles.pillActive : styles.pill}
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

        <div className={styles.actions}>
          <button type="submit" className={styles.button}>
            Apply filters
          </button>
        </div>
      </form>

      {loading ? <p className={styles.muted}>Loading…</p> : null}
      {err ? <p className={styles.error}>Unable to load member photos right now. {err}</p> : null}

      {!loading && !err ? (
        <div className={`${fanclubThreeColumnGridClassName} ${styles.gridWrap}`}>
          {items.map((p) => {
            const photoUrl = p.thumbnail_url || p.url;
            const title = p.title || p.description || `Photo #${p.id}`;

            return (
              <div key={p.id} className={styles.card}>
                <div className={styles.media}>
                  {photoUrl ? (
                    <img className={styles.image} src={photoUrl} alt={title} />
                  ) : (
                    <span className={styles.mediaFallback}>Photo media unavailable</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{title}</div>
                  {p.description && p.description !== title ? (
                    <p className={styles.cardText}>{p.description}</p>
                  ) : null}
                  {p.tags ? <div className={styles.cardMeta}>Tags: {p.tags}</div> : null}
                  {p.uploaded_by ? <div className={styles.cardMeta}>Source: {p.uploaded_by}</div> : null}
                </div>
              </div>
            );
          })}
          {items.length === 0 ? <div className={styles.empty}>No photos match your search.</div> : null}
        </div>
      ) : null}

      <p className={styles.footer}>
        Have a photo to share?{' '}
        <Link href="/fanclub/submit" className={styles.footerLink}>
          Submit a Photo →
        </Link>
      </p>
    </main>
  );
}
