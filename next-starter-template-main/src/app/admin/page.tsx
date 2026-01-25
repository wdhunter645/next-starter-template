'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Counts = Record<string, number>;

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '32px 16px', maxWidth: 1100, margin: '0 auto' },
  h1: { fontSize: 34, margin: '0 0 8px 0' },
  lead: { fontSize: 16, lineHeight: 1.7, margin: '0 0 18px 0' },
  card: {
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 16,
    padding: 16,
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(6px)',
    margin: '0 0 14px 0',
  },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  input: { padding: '10px 12px', fontSize: 14, borderRadius: 12, border: '1px solid rgba(0,0,0,0.2)' },
  btn: { padding: '10px 14px', fontSize: 14, borderRadius: 12, border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' },
  small: { fontSize: 13, opacity: 0.85 },
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: 14 },
  two: { display: 'grid', gridTemplateColumns: '1fr', gap: 14 },
  link: { color: 'var(--lgfc-blue)', textDecoration: 'none', fontWeight: 700 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, opacity: 0.8, padding: '8px 6px', borderBottom: '1px solid rgba(0,0,0,0.15)' },
  td: { padding: '8px 6px', borderBottom: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top', fontSize: 14 },
};

function useAdminToken() {
  const [token, setToken] = useState('');
  useEffect(() => {
    const t = sessionStorage.getItem('lgfc_admin_token') || '';
    setToken(t);
  }, []);
  function save(next: string) {
    setToken(next);
    sessionStorage.setItem('lgfc_admin_token', next);
  }
  return { token, setToken: save };
}

async function adminFetch(token: string, url: string, init?: RequestInit) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers['x-admin-token'] = token;
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { ok: false, raw: text }; }
  return { res, data };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={styles.card}>
      <h2 style={{ fontSize: 18, margin: '0 0 10px 0' }}>{title}</h2>
      {children}
    </section>
  );
}

function CountsTable({ counts }: { counts: Counts | null }) {
  const rows = useMemo(() => {
    if (!counts) return [];
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [counts]);

  if (!counts) return <div style={styles.small}>No data yet.</div>;

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Table</th>
          <th style={styles.th}>Rows</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td style={styles.td}><code>{k}</code></td>
            <td style={styles.td}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface FooterQuoteItem {
  id: number;
  quote: string;
  attribution: string;
  status: string;
}

function FooterQuotesAdmin({ token }: { token: string }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<FooterQuoteItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState('');
  const [attr, setAttr] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);
    setMsg(null);
    const { res, data } = await adminFetch(token, `/api/admin/footer-quotes?q=${encodeURIComponent(q)}`);
    if (res.ok && data?.ok) setItems((data.results as FooterQuoteItem[]) || []);
    else setMsg((data?.error as string) || 'Failed to load quotes.');
    setBusy(false);
  }

  async function add() {
    setBusy(true);
    setMsg(null);
    const { res, data } = await adminFetch(token, '/api/admin/footer-quotes', {
      method: 'POST',
      body: JSON.stringify({ quote, attribution: attr }),
    });
    if (res.ok && data?.ok) {
      setQuote('');
      setAttr('');
      await refresh();
    } else {
      setMsg((data?.error as string) || 'Failed to add quote.');
    }
    setBusy(false);
  }

  async function setStatus(id: number, status: 'posted' | 'hidden') {
    setBusy(true);
    setMsg(null);
    const { res, data } = await adminFetch(token, '/api/admin/footer-quotes', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
    if (res.ok && data?.ok) await refresh();
    else setMsg((data?.error as string) || 'Failed to update quote.');
    setBusy(false);
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={styles.row}>
        <input style={{ ...styles.input, minWidth: 220 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quotes" />
        <button style={styles.btn} onClick={refresh} disabled={busy}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gap: 8, padding: 12, border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 14 }}>
        <div style={styles.small}><strong>Add quote</strong></div>
        <input style={styles.input} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Quote" />
        <input style={styles.input} value={attr} onChange={(e) => setAttr(e.target.value)} placeholder="Attribution (optional)" />
        <button style={styles.btn} onClick={add} disabled={busy || !quote.trim()}>Add</button>
      </div>

      {msg && <div style={styles.small}><strong>Note:</strong> {msg}</div>}

      <div style={styles.small}><strong>Results:</strong> {items.length}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Quote</th>
              <th style={styles.th}>Attribution</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td style={styles.td}><code>{it.status}</code></td>
                <td style={styles.td}>{it.quote}</td>
                <td style={styles.td}>{it.attribution || ''}</td>
                <td style={styles.td}>
                  <div style={styles.row}>
                    <button style={styles.btn} onClick={() => setStatus(it.id, 'posted')} disabled={busy || it.status === 'posted'}>Post</button>
                    <button style={styles.btn} onClick={() => setStatus(it.id, 'hidden')} disabled={busy || it.status === 'hidden'}>Hide</button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td style={styles.td} colSpan={4}>No results.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface WorklistItem {
  id: number;
  task: string;
  status: string;
  owner: string;
  due_date: string;
  needed_completion_date: string;
}

function WorklistAdmin({ token }: { token: string }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<WorklistItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [task, setTask] = useState('');
  const [due, setDue] = useState('');
  const [owner, setOwner] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);
    setMsg(null);
    const { res, data } = await adminFetch(token, `/api/admin/worklist?q=${encodeURIComponent(q)}`);
    if (res.ok && data?.ok) setItems((data.results as WorklistItem[]) || []);
    else setMsg((data?.error as string) || 'Failed to load worklist.');
    setBusy(false);
  }

  async function add() {
    setBusy(true);
    setMsg(null);
    const { res, data } = await adminFetch(token, '/api/admin/worklist', {
      method: 'POST',
      body: JSON.stringify({ task, needed_completion_date: due, owner }),
    });
    if (res.ok && data?.ok) {
      setTask('');
      setDue('');
      setOwner('');
      await refresh();
    } else setMsg((data?.error as string) || 'Failed to add item.');
    setBusy(false);
  }

  async function setStatus(id: number, status: string) {
    setBusy(true);
    setMsg(null);
    const { res, data } = await adminFetch(token, '/api/admin/worklist', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
    if (res.ok && data?.ok) await refresh();
    else setMsg((data?.error as string) || 'Failed to update status.');
    setBusy(false);
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={styles.row}>
        <input style={{ ...styles.input, minWidth: 220 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks" />
        <button style={styles.btn} onClick={refresh} disabled={busy}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gap: 8, padding: 12, border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 14 }}>
        <div style={styles.small}><strong>Add task</strong></div>
        <input style={styles.input} value={task} onChange={(e) => setTask(e.target.value)} placeholder="Task" />
        <div style={styles.row}>
          <input style={styles.input} value={due} onChange={(e) => setDue(e.target.value)} placeholder="Needed completion date (YYYY-MM-DD)" />
          <input style={styles.input} value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Owner" />
        </div>
        <button style={styles.btn} onClick={add} disabled={busy || !task.trim()}>Add</button>
      </div>

      {msg && <div style={styles.small}><strong>Note:</strong> {msg}</div>}

      <div style={styles.small}><strong>Results:</strong> {items.length}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Task</th>
              <th style={styles.th}>Due</th>
              <th style={styles.th}>Owner</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td style={styles.td}><code>{it.status}</code></td>
                <td style={styles.td}>{it.task}</td>
                <td style={styles.td}>{it.needed_completion_date || ''}</td>
                <td style={styles.td}>{it.owner || ''}</td>
                <td style={styles.td}>
                  <div style={styles.row}>
                    <button style={styles.btn} onClick={() => setStatus(it.id, 'open')} disabled={busy || it.status === 'open'}>Open</button>
                    <button style={styles.btn} onClick={() => setStatus(it.id, 'in_progress')} disabled={busy || it.status === 'in_progress'}>In Progress</button>
                    <button style={styles.btn} onClick={() => setStatus(it.id, 'completed')} disabled={busy || it.status === 'completed'}>Completed</button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td style={styles.td} colSpan={5}>No results.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SingleDocAdmin({ token, title, getUrl, postUrl }: { token: string; title: string; getUrl: string; postUrl: string }) {
  const [docTitle, setDocTitle] = useState(title);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setMsg(null);
    const { res, data } = await adminFetch(token, getUrl);
    if (res.ok && data?.ok) {
      if (data?.title) setDocTitle(String(data.title));
      if (data?.body_md) setBody(String(data.body_md));
    } else setMsg((data?.error as string) || 'Failed to load.');
    setBusy(false);
  }

  async function publish() {
    setBusy(true);
    setMsg(null);
    const { res, data } = await adminFetch(token, postUrl, {
      method: 'POST',
      body: JSON.stringify({ title: docTitle, body_md: body }),
    });
    if (res.ok && data?.ok) setMsg('Published.');
    else setMsg((data?.error as string) || 'Failed to publish.');
    setBusy(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={styles.small}>Edit the current posted content. Publish replaces the posted version (history is preserved).</div>
      <input style={styles.input} value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Title" />
      <textarea
        style={{ ...styles.input, minHeight: 160, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Markdown body"
      />
      <div style={styles.row}>
        <button style={styles.btn} onClick={load} disabled={busy}>Reload</button>
        <button style={styles.btn} onClick={publish} disabled={busy || !body.trim()}>Publish</button>
      </div>
      {msg && <div style={styles.small}><strong>Note:</strong> {msg}</div>}
    </div>
  );
}

export default function AdminPage() {
  const { token, setToken } = useAdminToken();
  const [email, setEmail] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [statsMsg, setStatsMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Check if member is logged in and is admin
    async function checkAdmin() {
      try {
        const memberEmail = window.localStorage.getItem('lgfc_member_email');
        if (!memberEmail) {
          setIsLoading(false);
          return;
        }
        
        setEmail(memberEmail);
        
        // Check if user is admin
        const res = await fetch(`/api/fanclub/role?email=${encodeURIComponent(memberEmail)}`);
        
        if (!res.ok) {
          console.error('Failed to check admin role: HTTP', res.status);
          return;
        }
        
        const data = await res.json();
        
        if (data.ok && data.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        // User is not admin (default state)
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAdmin();
  }, []);

  async function refreshStats() {
    setBusy(true);
    setStatsMsg(null);
    const { res, data } = await adminFetch(token, '/api/admin/stats');
    if (res.ok && data?.ok) setCounts((data.counts as Record<string, number>) || {});
    else setStatsMsg((data?.error as string) || 'Stats not available. Check ADMIN_TOKEN.');
    setBusy(false);
  }

  // If still loading, show loading state
  if (isLoading) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Admin</h1>
        <p style={styles.lead}>Loading...</p>
      </main>
    );
  }

  // If not logged in, show login prompt
  if (!email) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Admin Access</h1>
        <p style={styles.lead}>You need to be logged in as a member to access this page.</p>
        <div style={styles.row}>
          <a style={styles.link} href="/login">Go to Login</a>
        </div>
      </main>
    );
  }

  // If logged in but not admin, show access denied
  if (!isAdmin) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Access Denied</h1>
        <p style={styles.lead}>
          You are logged in as {email}, but you do not have administrator privileges.
        </p>
        <div style={styles.row}>
          <a style={styles.link} href="/fanclub">Return to Member Home</a>
        </div>
      </main>
    );
  }

  // Admin user - show dashboard
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Admin</h1>
      <p style={styles.lead}>
        Admin operations hub. Logged in as: <strong>{email}</strong>
      </p>

      <Section title="Admin Access">
        <div style={styles.row}>
          <input
            style={{ ...styles.input, minWidth: 320 }}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste ADMIN_TOKEN"
            autoCapitalize="none"
          />
          <button style={styles.btn} onClick={refreshStats} disabled={busy || !token}>Refresh Health</button>
          <a style={styles.link} href="/" target="_blank" rel="noopener noreferrer">Open Site</a>
        </div>
        <div style={styles.small}>
          Token is stored in <code>sessionStorage</code> only. You must be a logged-in admin member to access this page.
        </div>
      </Section>

      <Section title="Top of Page Health Snapshot">
        {statsMsg && <div style={styles.small}><strong>Note:</strong> {statsMsg}</div>}
        <CountsTable counts={counts} />
      </Section>

      <div style={styles.two}>
        <Section title="Quick Links">
          <div style={{ display: 'grid', gap: 8 }}>
            <a style={styles.link} href="/admin/content">Site Content (CMS)</a>
            <a style={styles.link} href="/admin/fanclub/library">Gehrig Library</a>
            <a style={styles.link} href="/admin/fanclub/fanclub/photo">Photos</a>
            <a style={styles.link} href="/admin/export">Export</a>
          </div>
          <div style={{ marginTop: 10, ...styles.small }}>
            Remaining admin sections are implemented inline below per design locks (search + add).
          </div>
        </Section>

        <Section title="Admin Team Worklist">
          <WorklistAdmin token={token} />
        </Section>
      </div>

      <div style={styles.grid}>
        <Section title="Site Text: Footer Quotes">
          <FooterQuotesAdmin token={token} />
        </Section>

        <Section title="Membership Card Content">
          <SingleDocAdmin token={token} title="Membership Card" getUrl="/api/admin/fanclubship-card" postUrl="/api/admin/fanclubship-card" />
        </Section>

        <Section title="Welcome Email Content">
          <SingleDocAdmin token={token} title="Welcome Email" getUrl="/api/admin/welcome-email" postUrl="/api/admin/welcome-email" />
        </Section>
      </div>
    </main>
  );
}
