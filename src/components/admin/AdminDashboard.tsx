'use client';

import React, { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';

type CountRow = { table: string; count: number };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function asCounts(data: unknown): CountRow[] {
  if (!isRecord(data) || data.ok !== true) return [];
  const counts = (data as Record<string, unknown>).counts;
  if (!isRecord(counts)) return [];
  const rows: CountRow[] = [];
  for (const [k, v] of Object.entries(counts)) {
    const n = typeof v === 'number' ? v : (typeof v === 'string' ? Number(v) : NaN);
    if (!Number.isFinite(n)) continue;
    rows.push({ table: k, count: n });
  }
  rows.sort((a, b) => a.table.localeCompare(b.table));
  return rows;
}

export default function AdminDashboard() {
  const [status, setStatus] = useState<string>('');
  const [rows, setRows] = useState<CountRow[]>([]);

  async function loadStats() {
    setStatus('Loading stats…');
    const token = getToken();
    const res = await fetch('/api/admin/stats', {
      headers: token ? { 'x-admin-token': token } : {},
      cache: 'no-store',
    });

    const data: unknown = await res.json().catch(() => ({}));
    if (!isRecord(data) || data.ok !== true) {
      const err = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
      setStatus(`Error: ${err}`);
      setRows([]);
      return;
    }

    setRows(asCounts(data));
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

        <a className={styles.card} href="/admin/join-requests">
          <div className={styles.cardTitle}>Join Requests</div>
          <div className={styles.cardBody}>View recent join requests captured from /join.</div>
        </a>

        <a className={styles.card} href="/admin/media-assets">
          <div className={styles.cardTitle}>Media Assets</div>
          <div className={styles.cardBody}>Inspect ingested media in D1 (Backblaze B2 keys, size, etag).</div>
        </a>

        <a className={styles.card} href="/admin/cms">
          <div className={styles.cardTitle}>CMS</div>
          <div className={styles.cardBody}>Admin tools (work in progress).</div>
        </a>

        <a className={styles.card} href="/admin/d1-test">
          <div className={styles.cardTitle}>D1 Inspect</div>
          <div className={styles.cardBody}>Connectivity checks and diagnostics.</div>
        </a>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>D1 Table Counts</div>
          <button className={styles.btn} onClick={() => void loadStats()}>
            Refresh
          </button>
        </div>

        {status ? <p className={styles.status}>{status}</p> : null}

        <div className={styles.statsGrid}>
          {rows.map((r) => (
            <div key={r.table} className={styles.stat}>
              <div className={styles.statLabel}>{r.table}</div>
              <div className={styles.statValue}>{r.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
