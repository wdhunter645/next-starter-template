'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';

type StatsResponse = { ok: boolean; counts?: Record<string, number>; error?: string };

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function setToken(t: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('lgfc_admin_token', t);
}

export default function AdminDashboard() {
  const [token, setTokenState] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    setTokenState(getToken());
  }, []);

  const total = useMemo(() => {
    if (!counts) return 0;
    return Object.values(counts).reduce((a, b) => a + (Number(b) || 0), 0);
  }, [counts]);

  async function loadStats() {
    const t = token.trim();
    if (!t) {
      setErr('Enter ADMIN_TOKEN to load D1 row counts.');
      setCounts(null);
      return;
    }

    setLoading(true);
    setErr('');

    try {
      setToken(t);
      const res = await fetch('/api/admin/stats', { headers: { 'x-admin-token': t } });
      const data = (await res.json()) as StatsResponse;
      if (!data?.ok) throw new Error(data?.error || 'Stats failed');
      setCounts(data.counts || {});
    } catch (e: any) {
      setCounts(null);
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className={styles.tokenCard}>
        <div className={styles.tokenRow}>
          <label className={styles.tokenLabel} htmlFor="admintoken">Admin token</label>
          <input
            id="admintoken"
            className={styles.tokenInput}
            type="password"
            value={token}
            onChange={e => setTokenState(e.target.value)}
            placeholder="ADMIN_TOKEN"
            autoComplete="off"
          />
          <button className={styles.tokenBtn} type="button" onClick={loadStats} disabled={loading}>
            {loading ? 'Loading…' : 'Load stats'}
          </button>
        </div>
        <p className={styles.tokenHelp}>
          This token is stored in your browser localStorage as <code>lgfc_admin_token</code>.
        </p>
        {err ? <p className={styles.err}>{err}</p> : null}
      </section>

      {counts ? (
        <section className={styles.statsCard}>
          <div className={styles.statsHead}>
            <h2 className={styles.statsTitle}>D1 table row counts</h2>
            <div className={styles.statsMeta}>Total rows (all listed tables): <strong>{total}</strong></div>
          </div>
          <div className={styles.statsGrid}>
            {Object.entries(counts).map(([k, v]) => (
              <div key={k} className={styles.statsItem}>
                <div className={styles.statsKey}>{k}</div>
                <div className={styles.statsVal}>{v}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>FAQ</h2>
          <p>Review pending questions, approve/deny, and pin top entries.</p>
          <div className={styles.actions}>
            <Link className={styles.linkBtn} href="/admin/faq">Open FAQ Queue</Link>
          </div>
        </section>

        <section className={styles.card}>
          <h2>Page Content</h2>
          <p>Draft and publish page sections stored in D1 (page_content).</p>
          <div className={styles.actions}>
            <Link className={styles.linkBtn} href="/admin/content">Manage Page Content</Link>
          </div>
        </section>

        <section className={styles.card}>
          <h2>CMS Blocks</h2>
          <p>Manage content_blocks for richer, multi-block pages.</p>
          <div className={styles.actions}>
            <Link className={styles.linkBtn} href="/admin/cms">Open CMS</Link>
          </div>
        </section>

        <section className={styles.card}>
          <h2>D1 Inspect</h2>
          <p>Quick DB introspection: tables, counts, and a safe query runner.</p>
          <div className={styles.actions}>
            <Link className={styles.linkBtn} href="/admin/d1-test">Open D1 Tools</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
