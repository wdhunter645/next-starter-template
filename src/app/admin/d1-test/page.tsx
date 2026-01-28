'use client';

import React, { useEffect, useMemo, useState } from 'react';

type TableInfo = { name: string; count: number };
type TableDetail = { table: string; schema: unknown[]; rows: unknown[] };

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '32px 16px', maxWidth: 1100, margin: '0 auto' },
  h1: { fontSize: 34, margin: '0 0 8px 0' },
  lead: { fontSize: 16, lineHeight: 1.7, margin: '0 0 18px 0' },
  row: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  input: { padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.25)', minWidth: 260 },
  btn: { padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.25)', background: 'white', cursor: 'pointer' },
  card: { border: '1px solid rgba(0,0,0,0.15)', borderRadius: 16, padding: 16, marginTop: 16, background: 'rgba(255,255,255,0.9)' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 10 },
  th: { textAlign: 'left', padding: '8px 6px', borderBottom: '1px solid rgba(0,0,0,0.15)' },
  td: { padding: '8px 6px', borderBottom: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 13 },
  small: { fontSize: 13, opacity: 0.85 },
  err: { color: '#b00020', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 13, whiteSpace: 'pre-wrap' },
  pre: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 13, whiteSpace: 'pre-wrap' },
};

function useAdminToken() {
  const [token, setToken] = useState('');
  useEffect(() => {
    try {
      const t = sessionStorage.getItem('lgfc_admin_token') || '';
      setToken(t);
    } catch {}
  }, []);

  const save = (next: string) => {
    setToken(next);
    try {
      sessionStorage.setItem('lgfc_admin_token', next);
    } catch {}
  };

  return { token, setToken: save };
}

async function adminFetch(token: string, url: string) {
  const headers: Record<string, string> = {};
  if (token) headers['x-admin-token'] = token;
  const res = await fetch(url, { headers });
  const text = await res.text();
  let data: unknown = null;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { res, data };
}

export default function AdminD1TestPage() {
  const { token, setToken } = useAdminToken();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [detail, setDetail] = useState<TableDetail | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const sorted = useMemo(() => [...tables].sort((a, b) => a.name.localeCompare(b.name)), [tables]);

  const load = async () => {
    setLoading(true);
    setError('');
    setDetail(null);
    try {
      const { res, data } = await adminFetch(token, '/api/admin/d1-inspect');
      if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
      setTables((data as { tables?: TableInfo[] }).tables || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const loadTable = async (name: string) => {
    setSelected(name);
    setLoading(true);
    setError('');
    setDetail(null);
    try {
      const { res, data } = await adminFetch(token, `/api/admin/d1-inspect?table=${encodeURIComponent(name)}&limit=5`);
      if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
      setDetail(data as TableDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // auto-load if token exists
    if (token) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Admin • D1 Test</h1>
      <p style={styles.lead}>
        This page is a diagnostic view of all D1 tables: row counts, schema, and sample rows.
        It requires your admin token (stored in sessionStorage as <code>lgfc_admin_token</code>).
      </p>

      <div style={styles.card}>
        <div style={styles.row}>
          <input
            style={styles.input}
            type="password"
            placeholder="Paste ADMIN_TOKEN here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button style={styles.btn} onClick={load} disabled={loading || !token}>
            {loading ? 'Loading…' : 'Load table list'}
          </button>
          <a href="/admin" style={{ ...styles.small, textDecoration: 'underline' }}>Back to Admin</a>
        </div>
        {!token && <div style={{ ...styles.small, marginTop: 10 }}>ADMIN_TOKEN is not set here yet. Paste it, then click “Load table list”.</div>}
      </div>

      {error && (
        <div style={styles.card}>
          <div style={styles.err}>{error}</div>
        </div>
      )}

      {!!sorted.length && (
        <div style={styles.card}>
          <div style={styles.small}>Tables ({sorted.length}) — click a row to inspect</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Table</th>
                <th style={styles.th}>Rows</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.name} onClick={() => loadTable(t.name)} style={{ cursor: 'pointer', background: t.name === selected ? 'rgba(0,0,0,0.04)' : 'transparent' }}>
                  <td style={styles.td}>{t.name}</td>
                  <td style={styles.td}>{t.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div style={styles.card}>
          <div style={styles.small}>Detail: <strong>{detail.table}</strong></div>
          <div style={{ marginTop: 12 }}>
            <div style={styles.small}><strong>Schema</strong></div>
            <pre style={styles.pre}>{JSON.stringify(detail.schema, null, 2)}</pre>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={styles.small}><strong>Sample rows</strong></div>
            <pre style={styles.pre}>{JSON.stringify(detail.rows, null, 2)}</pre>
          </div>
        </div>
      )}
    </main>
  );
}
