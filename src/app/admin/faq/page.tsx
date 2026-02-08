'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';

type FAQEntry = {
  id: number;
  question: string;
  answer: string;
  status: string;
  submitter_email: string | null;
  view_count: number;
  pinned: number;
  created_at: string;
  updated_at: string;
};

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function setStoredToken(t: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('lgfc_admin_token', t);
}

export default function AdminFAQPage() {
  const [token, setToken] = useState('');
  const [pendingItems, setPendingItems] = useState<FAQEntry[]>([]);
  const [approvedItems, setApprovedItems] = useState<FAQEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAnswer, setEditAnswer] = useState('');

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  const loadFAQs = async (overrideToken?: string) => {
    const useToken = (overrideToken ?? token).trim();
    if (!useToken) {
      setError('Admin token required.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      setStoredToken(useToken);
      const headers = { 'x-admin-token': useToken };

      const [pendingRes, approvedRes] = await Promise.all([
        fetch('/api/admin/faq/pending', { headers }),
        fetch('/api/admin/faq/approved', { headers }),
      ]);

      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();

      if (!pendingData.ok) throw new Error(pendingData.error || 'Failed to load pending FAQs');
      if (!approvedData.ok) throw new Error(approvedData.error || 'Failed to load approved FAQs');

      setPendingItems(pendingData.items || []);
      setApprovedItems(approvedData.items || []);
    } catch (e: any) {
      setError(String(e?.message || e));
      setPendingItems([]);
      setApprovedItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadFAQs(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const startEdit = (item: FAQEntry) => {
    setEditingId(item.id);
    setEditAnswer(item.answer || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAnswer('');
  };

  const approve = async (id: number) => {
    if (!token) return;
    setError('');
    try {
      const res = await fetch('/api/admin/faq/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ id, answer: editAnswer }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Approve failed');
      cancelEdit();
      await loadFAQs(token);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  };

  const deny = async (id: number) => {
    if (!token) return;
    setError('');
    try {
      const res = await fetch('/api/admin/faq/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Deny failed');
      cancelEdit();
      await loadFAQs(token);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  };

  const pin = async (id: number, pinned: number) => {
    if (!token) return;
    setError('');
    try {
      const res = await fetch('/api/admin/faq/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ id, pinned }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Pin failed');
      await loadFAQs(token);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  };

  return (
    <PageShell title="Admin – FAQ Queue" subtitle="Approve, deny, pin, and publish FAQ content from D1">
      <AdminNav />

      <section style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.95)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label htmlFor="admintoken" style={{ fontWeight: 700 }}>Admin token</label>
          <input
            id="admintoken"
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.22)', minWidth: 260 }}
          />
          <button
            type="button"
            onClick={() => loadFAQs(token)}
            style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.22)', background: '#fff', fontWeight: 700 }}
          >
            Reload
          </button>
          <Link href="/faq" style={{ fontWeight: 700, textDecoration: 'none' }}>View public FAQ</Link>
        </div>

        <p style={{ margin: '10px 0 0 0', fontSize: 13, opacity: 0.85 }}>
          Token is stored in your browser localStorage as <code>lgfc_admin_token</code>.
        </p>

        {error ? <p style={{ margin: '10px 0 0 0', color: '#b00020', fontWeight: 700 }}>{error}</p> : null}
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ margin: 0 }}>Pending ({pendingItems.length})</h2>
        {loading ? <p>Loading…</p> : null}
        {!loading && pendingItems.length === 0 ? <p>No pending items.</p> : null}

        {pendingItems.map(item => {
          const isEditing = editingId === item.id;
          return (
            <div
              key={item.id}
              style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, padding: 16, background: '#fff', marginTop: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>ID {item.id} • {item.created_at}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginTop: 6 }}>{item.question}</div>
                  {item.submitter_email ? <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>From: {item.submitter_email}</div> : null}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.22)', background: '#fff', fontWeight: 700 }}
                    >
                      Write answer
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => deny(item.id)}
                    style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.22)', background: '#fff', fontWeight: 700 }}
                  >
                    Deny
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Answer</label>
                  <textarea
                    value={editAnswer}
                    onChange={e => setEditAnswer(e.target.value)}
                    rows={5}
                    style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.22)' }}
                  />
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => approve(item.id)}
                      style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.22)', background: '#fff', fontWeight: 700 }}
                    >
                      Approve + Publish
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.22)', background: '#fff', fontWeight: 700 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ margin: 0 }}>Approved ({approvedItems.length})</h2>
        {!loading && approvedItems.length === 0 ? <p>No approved items.</p> : null}

        {approvedItems.map(item => (
          <div
            key={item.id}
            style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, padding: 16, background: '#fff', marginTop: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>ID {item.id} • views {item.view_count} • updated {item.updated_at}</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginTop: 6 }}>{item.question}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => pin(item.id, item.pinned ? 0 : 1)}
                  style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.22)', background: '#fff', fontWeight: 700 }}
                >
                  {item.pinned ? 'Unpin' : 'Pin'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{item.answer}</div>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
