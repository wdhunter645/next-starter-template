'use client';

import { useEffect, useMemo, useState } from 'react';

type DiscussionItem = {
  id: number;
  title: string;
  body: string;
  author_email?: string;
  created_at: string;
};

function getLocalEmail(): string {
  try {
    return window.localStorage.getItem('lgfc_member_email') || '';
  } catch {
    return '';
  }
}

export default function FanclubChatPage() {
  const [items, setItems] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const baseStyle = useMemo(() => ({
    maxWidth: 980,
    margin: '0 auto',
    padding: '28px 16px',
  }), []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/discussions/list?limit=20', { cache: 'no-store' });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'list_failed');
      setItems(json.items || []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEmail(getLocalEmail());
    load();
  }, []);

  async function submitPost(title: string, body: string) {
    const res = await fetch('/api/discussions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, author_email: email || 'member' }),
    });
    const json = await res.json();
    if (!json?.ok) throw new Error(json?.error || 'create_failed');
    await load();
  }

  async function reportItem(target_id: number, reason: string) {
    const res = await fetch('/api/reports/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'discussion', target_id, reporter_email: email, reason }),
    });
    const json = await res.json();
    if (!json?.ok) throw new Error(json?.error || 'report_failed');
  }

  return (
    <main style={baseStyle}>
      <h1 style={{ fontSize: 32, margin: '0 0 8px 0' }}>Member Chat</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Post short notes, questions, and updates. Reports go to the admin moderation queue.
      </p>

      <ChatComposer onSubmit={submitPost} disabled={!email} />
      {!email && (
        <div style={{ marginTop: 10, padding: 12, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, opacity: 0.9 }}>
          You appear to be missing a stored member email. Login again to restore session.
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Latest posts</h2>
          <button
            onClick={load}
            style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>

        {loading && <p style={{ opacity: 0.85 }}>Loading…</p>}
        {error && <p style={{ color: 'salmon' }}>Error: {error}</p>}

        {!loading && !error && (
          <ChatFeed items={items} onReport={reportItem} />
        )}
      </div>
    </main>
  );
}

function ChatComposer({ onSubmit, disabled }: { onSubmit: (title: string, body: string) => Promise<void>; disabled: boolean }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const canSubmit = !disabled && title.trim().length >= 3 && body.trim().length >= 5 && !busy;

  async function go() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      await onSubmit(title.trim(), body.trim());
      setTitle('');
      setBody('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ marginTop: 14, padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.14)' }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Create a post</h2>
      <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.2)' }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
          rows={4}
          style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.2)', resize: 'vertical' }}
        />
        <button
          onClick={go}
          disabled={!canSubmit}
          style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)', background: canSubmit ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
        >
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
    </section>
  );
}

function ChatFeed({ items, onReport }: { items: DiscussionItem[]; onReport: (id: number, reason: string) => Promise<void> }) {
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportError, setReportError] = useState<string>('');
  const [reportOk, setReportOk] = useState<string>('');

  async function submitReport() {
    if (!reportingId) return;
    setReportError('');
    setReportOk('');
    try {
      await onReport(reportingId, reportReason.trim());
      setReportOk('Report submitted.');
      setReportReason('');
      setReportingId(null);
    } catch (e: any) {
      setReportError(String(e?.message || e));
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
      {items.length === 0 && (
        <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', opacity: 0.85 }}>
          No posts yet.
        </div>
      )}

      {items.map((it) => (
        <article key={it.id} style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>{it.title}</h3>
            <span style={{ marginLeft: 'auto', opacity: 0.75, fontSize: 12 }}>{new Date(it.created_at).toLocaleString()}</span>
          </div>
          <p style={{ margin: '10px 0 0 0', opacity: 0.92, whiteSpace: 'pre-wrap' }}>{it.body}</p>
          <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => { setReportingId(it.id); setReportOk(''); setReportError(''); }}
              style={{ padding: '7px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', cursor: 'pointer', opacity: 0.9 }}
            >
              Report
            </button>
          </div>
        </article>
      ))}

      {reportingId && (
        <section style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Report post #{reportingId}</h3>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Why is this post a problem?"
            rows={3}
            style={{ width: '100%', marginTop: 10, padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.2)' }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
            <button
              onClick={submitReport}
              disabled={reportReason.trim().length < 5}
              style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}
            >
              Submit report
            </button>
            <button
              onClick={() => { setReportingId(null); setReportReason(''); }}
              style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.8 }}>Reports are reviewed by admins.</span>
          </div>
          {reportError && <p style={{ color: 'salmon', marginTop: 8 }}>Error: {reportError}</p>}
          {reportOk && <p style={{ color: 'lightgreen', marginTop: 8 }}>{reportOk}</p>}
        </section>
      )}
    </div>
  );
}
