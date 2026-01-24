'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

type FAQItem = { id: number; question: string; answer: string; updated_at: string };

export default function AskPage() {
  const { isAuthenticated, isChecking } = useAuthRedirect();
  const [query, setQuery] = useState('');
  const [question, setQuestion] = useState('');
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitOk, setSubmitOk] = useState(false);
  const [submitErr, setSubmitErr] = useState<string>('');

  const q = useMemo(() => query.trim(), [query]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ ok: boolean; items: FAQItem[] }>(`/api/faq/list?limit=50&q=${encodeURIComponent(q)}`);
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  if (isChecking || !isAuthenticated) {
    return null;
  }

  const submit = async () => {
    setSubmitOk(false);
    setSubmitErr('');
    const text = question.trim();
    if (!text) return;

    try {
      await apiPost<{ ok: boolean }>(`/api/faq/submit`, { question: text });
      setQuestion('');
      setSubmitOk(true);
      setTimeout(() => setSubmitOk(false), 3000);
    } catch (e: unknown) {
      setSubmitErr(String((e as Error)?.message ?? e));
    }
  };

  return (
    <main className="container" style={{ padding: '40px 16px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 10px 0' }}>FAQ and Ask a Question</h1>
      <p className="sub" style={{ marginTop: 0 }}>
        This page proves live connectivity to D1: FAQ results read from <code>faq_entries</code>, and new questions submit into that table as <code>pending</code>.
      </p>

      <section className="card" style={{ marginTop: 18 }}>
        <label htmlFor="qtext"><strong>Ask a question</strong></label>
        <textarea id="qtext" placeholder="Type your question..." value={question} onChange={(e) => setQuestion(e.target.value)} />
        <button type="button" onClick={submit}>Submit</button>
        {submitOk ? <div className="success" style={{ marginTop: 10 }}>Thanks! Your question was received and queued for review.</div> : null}
        {submitErr ? <div className="sub" style={{ marginTop: 10, color: '#b00020' }}>Submit failed: {submitErr}</div> : null}
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 className="section-title">Browse FAQ</h2>
        <div className="faq" style={{ marginTop: 10 }}>
          <div className="search">
            <input type="search" placeholder="Search questions..." aria-label="Search questions" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={() => setQuery('')}>Clear</button>
          </div>

          {loading ? (
            <p className="sub">Loading…</p>
          ) : items.length === 0 ? (
            <p className="sub">No approved FAQs found.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="q">
                <strong>{item.question}</strong>
                <br />
                <span className="sub">{item.answer}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
