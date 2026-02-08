'use client';

import React, { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';

type StatRow = { label: string; value: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

export default function AdminDashboard() {
  const [status, setStatus] = useState<string>('');
  const [stats, setStats] = useState<StatRow[]>([]);

  async function loadStats() {
    setStatus('Loading stats…');
    const token = getToken();
    const res = await fetch('/api/admin/d1/stats', {
      headers: token ? { 'x-admin-token': token } : {},
      cache: 'no-store',
    });

    const data: unknown = await res.json().catch(() => ({}));
    if (!isRecord(data) || data.ok !== true) {
      const err = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
      setStatus(`Error: ${err}`);
      setStats([]);
      return;
    }

    const rawStats = (data as Record<string, unknown>).stats;
    const arr = Array.isArray(rawStats) ? rawStats : [];
    const normalized: StatRow[] = arr
      .map((r) => {
        if (!isRecord(r)) return null;
        const label = typeof r.label === 'string' ? r.label : null;
        const value = typeof r.value === 'string' ? r.value : null;
        if (!label || !value) return null;
        return { label, value };
      })
      .filter((x): x is StatRow => x !== null);

    setStats(normalized);
    setStatus('');
  }

  useEffect(() => {
    void loadStats();
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <a className={styles.card} href="/admin/content">
          <div className={styles.cardTitle}>Page Content</div>
          <div className={styles.cardBody}>Edit D1-backed content blocks (draft + publish).</div>
        </a>

        <a className={styles.card} href="/admin/faq">
          <div className={styles.cardTitle}>FAQ Admin</div>
          <div className={styles.cardBody}>Moderate questions, approvals, pinning, and views.</div>
        </a>

        <a className={styles.card} href="/admin/cms">
          <div className={styles.cardTitle}>CMS</div>
          <div className={styles.cardBody}>Admin tools (work in progress).</div>
        </a>

        <a className={styles.card} href="/admin/d1-test">
          <div className={styles.cardTitle}>D1 Test</div>
          <div className={styles.cardBody}>Connectivity checks and diagnostics.</div>
        </a>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>D1 Stats</div>
          <button className={styles.btn} onClick={() => void loadStats()}>
            Refresh
          </button>
        </div>

        {status ? <p className={styles.status}>{status}</p> : null}

        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statValue}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
