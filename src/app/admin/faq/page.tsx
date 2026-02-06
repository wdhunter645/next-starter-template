'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function AdminFAQPage() {
  const [token, setToken] = useState('');
  const [pendingItems, setPendingItems] = useState<FAQEntry[]>([]);
  const [approvedItems, setApprovedItems] = useState<FAQEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAnswer, setEditAnswer] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('lgfc_admin_token');
    if (stored) setToken(stored);
  }, []);

  const loadFAQs = async () => {
    if (!token) {
      setError('Admin token required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers = { 'x-admin-token': token };
      
      // Load pending entries
      const pendingRes = await fetch('/api/admin/faq/pending', { headers });
      if (!pendingRes.ok) throw new Error('Failed to load pending FAQs');
      const pendingData = await pendingRes.json();
      setPendingItems(pendingData.items || []);

      // Load approved entries
      const approvedRes = await fetch('/api/admin/faq/approved', { headers });
      if (!approvedRes.ok) throw new Error('Failed to load approved FAQs');
      const approvedData = await approvedRes.json();
      setApprovedItems(approvedData.items || []);
    } catch (e: unknown) {
      setError(String((e as Error)?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadFAQs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleApprove = async (id: number, answer: string) => {
    if (!answer.trim()) {
      alert('Answer is required to approve');
      return;
    }

    try {
      const res = await fetch('/api/admin/faq/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ id, answer: answer.trim() }),
      });

      if (!res.ok) throw new Error('Failed to approve');
      setEditingId(null);
      setEditAnswer('');
      loadFAQs();
    } catch (e: unknown) {
      alert(`Approve failed: ${String((e as Error)?.message ?? e)}`);
    }
  };

  const handleDeny = async (id: number) => {
    if (!confirm('Are you sure you want to deny this question?')) return;

    try {
      const res = await fetch('/api/admin/faq/deny', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to deny');
      loadFAQs();
    } catch (e: unknown) {
      alert(`Deny failed: ${String((e as Error)?.message ?? e)}`);
    }
  };

  const handleTogglePin = async (id: number, currentPinned: number) => {
    const newPinned = currentPinned ? 0 : 1;

    try {
      const res = await fetch('/api/admin/faq/pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ id, pinned: newPinned }),
      });

      if (!res.ok) throw new Error('Failed to toggle pin');
      loadFAQs();
    } catch (e: unknown) {
      alert(`Pin toggle failed: ${String((e as Error)?.message ?? e)}`);
    }
  };

  const handleTokenSubmit = () => {
    const input = prompt('Enter admin token:');
    if (input) {
      setToken(input);
      sessionStorage.setItem('lgfc_admin_token', input);
    }
  };

  if (!token) {
    return (
      <main className="container" style={{ padding: '40px 16px', maxWidth: 1200 }}>
        <h1>Admin FAQ Management</h1>
        <p className="sub">Admin token required</p>
        <button onClick={handleTokenSubmit}>Set Token</button>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '40px 16px', maxWidth: 1200 }}>
      <h1>Admin FAQ Management</h1>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin" className="link">← Back to Admin Dashboard</Link>
      </div>

      {loading && <p className="sub">Loading...</p>}
      {error && <p style={{ color: '#b00020' }}>{error}</p>}

      {/* Pending Entries */}
      <section style={{ marginTop: 30 }}>
        <h2>Pending Questions ({pendingItems.length})</h2>
        {pendingItems.length === 0 ? (
          <p className="sub">No pending questions</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {pendingItems.map((item) => (
              <div key={item.id} className="card" style={{ padding: 16 }}>
                <div><strong>Q:</strong> {item.question}</div>
                <div className="sub" style={{ marginTop: 8 }}>
                  Submitted by: {item.submitter_email || 'Unknown'}
                  {' • '}
                  {new Date(item.created_at).toLocaleString()}
                </div>

                {editingId === item.id ? (
                  <div style={{ marginTop: 12 }}>
                    <label htmlFor={`answer-${item.id}`}><strong>Answer:</strong></label>
                    <textarea
                      id={`answer-${item.id}`}
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      placeholder="Type the answer..."
                      rows={4}
                      style={{ marginTop: 8, width: '100%' }}
                    />
                    <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                      <button onClick={() => handleApprove(item.id, editAnswer)}>
                        Approve with Answer
                      </button>
                      <button 
                        onClick={() => {
                          setEditingId(null);
                          setEditAnswer('');
                        }}
                        style={{ background: '#666' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                    <button 
                      onClick={() => {
                        setEditingId(item.id);
                        setEditAnswer('');
                      }}
                    >
                      Approve...
                    </button>
                    <button 
                      onClick={() => handleDeny(item.id)}
                      style={{ background: '#b00020' }}
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Entries */}
      <section style={{ marginTop: 50 }}>
        <h2>Approved FAQs ({approvedItems.length})</h2>
        {approvedItems.length === 0 ? (
          <p className="sub">No approved FAQs</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {approvedItems.map((item) => (
              <div key={item.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div><strong>Q:</strong> {item.question}</div>
                    <div style={{ marginTop: 4 }}><strong>A:</strong> {item.answer}</div>
                    <div className="sub" style={{ marginTop: 8 }}>
                      Views: {item.view_count} • 
                      {item.pinned ? ' 📌 Pinned' : ' Not pinned'}
                    </div>
                  </div>
                  <div style={{ marginLeft: 16 }}>
                    <button 
                      onClick={() => handleTogglePin(item.id, item.pinned)}
                      style={{ fontSize: 14, padding: '6px 12px' }}
                    >
                      {item.pinned ? 'Unpin' : 'Pin'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
