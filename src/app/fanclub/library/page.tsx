'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';

type LibraryItem = {
  id: number;
  title: string | null;
  content?: string | null;
  description?: string | null;
  author?: string | null;
  year?: number | null;
  created_at?: string | null;
};

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '40px 16px', maxWidth: 1000, margin: '0 auto' },
  h1: { fontSize: 34, lineHeight: 1.15, margin: '0 0 12px 0' },
  lead: { fontSize: 18, lineHeight: 1.6, margin: '0 0 18px 0' },
  p: { fontSize: 16, lineHeight: 1.7, margin: '0 0 14px 0' },
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: 18 },
  card: { border: '1px solid rgba(0,0,0,0.15)', borderRadius: 16, padding: 16 },
  label: { display: 'grid', gap: 6, fontSize: 14 },
  input: { padding: '10px 12px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)' },
  btn: { padding: '10px 14px', fontSize: 15, borderRadius: 12, border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer', textDecoration: 'none' },
  meta: { opacity: 0.75, fontSize: 13, marginTop: 6 },
  hr: { margin: '18px 0', opacity: 0.25 },
};

export default function LibraryPage() {
  const { isLoading, isAuthenticated } = useMemberSession({ redirectTo: '/' });
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((it) => {
      const title = it.title || '';
      const content = it.content || it.description || '';
      const author = it.author || '';
      return title.toLowerCase().includes(needle) || content.toLowerCase().includes(needle) || author.toLowerCase().includes(needle);
    });
  }, [items, query]);

  async function load() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/fanclub/library?page=1', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setItems(Array.isArray(data.items) ? data.items : []);
      } else {
        setItems([]);
        setMessage(data?.error || 'Unable to load library items right now.');
      }
    } catch {
      setItems([]);
      setMessage('Unable to load library items right now.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      load();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Library</h1>
      <p style={styles.lead}>
        A read-only member view of library entries about Lou Gehrig and related history.
      </p>
      <p style={styles.p}>
        Use search to quickly locate entries by title or body text, then jump to memorabilia or other Fan Club pages from the links below.
      </p>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={{ margin: 0 }}>Browse entries</h2>
          <hr style={styles.hr} />
          <label style={styles.label}>
            Search
            <input
              style={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles or entry text"
            />
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            <Link href="/fanclub/submit" style={styles.btn}>
              Submit an Article
            </Link>
            <Link href="/fanclub/memorabilia" style={styles.btn}>
              View Memorabilia
            </Link>
            <Link href="/fanclub" style={styles.btn}>
              Back to Fan Club Home
            </Link>
          </div>
          {message ? <p style={{ ...styles.p, marginTop: 12 }}>{message}</p> : null}
        </section>

        <section style={styles.card}>
          <h2 style={{ margin: 0 }}>Recent entries</h2>
          <hr style={styles.hr} />
          {loading ? (
            <p style={styles.p}>Loading…</p>
          ) : filteredItems.length === 0 ? (
            <p style={styles.p}>No entries yet.</p>
          ) : (
            filteredItems.map((it) => (
              <article key={it.id} style={{ marginBottom: 14 }}>
                <h3 style={{ margin: '0 0 6px 0' }}>{it.title || 'Untitled library entry'}</h3>
                <div style={styles.meta}>
                  {[it.author ? `By ${it.author}` : null, it.year ? String(it.year) : null, it.created_at ? new Date(it.created_at).toLocaleString() : null]
                    .filter(Boolean)
                    .join(' • ') || 'Member library entry'}
                </div>
                <p style={{ ...styles.p, marginTop: 8, whiteSpace: 'pre-wrap' }}>{it.content || it.description || 'No description available yet.'}</p>
                <hr style={styles.hr} />
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
