'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';

export default function AskPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [submitOk, setSubmitOk] = useState(false);
  const [submitErr, setSubmitErr] = useState<string>('');

  const isValidEmail = (email: string): boolean => {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return trimmed.length > 0 && 
           trimmed.length <= 254 &&
           emailRegex.test(trimmed);
  };

  const canSubmit = question.trim().length >= 10 && isValidEmail(email);

  const submit = async () => {
    setSubmitOk(false);
    setSubmitErr('');
    const text = question.trim();
    const emailText = email.trim();
    if (!text || !emailText || !canSubmit) return;

    try {
      const res = await apiPost<{ ok: boolean; error?: string }>('/api/faq/submit', { 
        question: text, 
        email: emailText 
      });
      if (!res.ok) throw new Error(res.error || 'Submit failed');
      setQuestion('');
      setEmail('');
      setSubmitOk(true);
    } catch (e: unknown) {
      setSubmitErr(String((e as Error)?.message ?? e));
    }
  };

  const handleCancel = () => {
    router.push('/#faq');
  };

  return (
    <main className="container" style={{ padding: '40px 16px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 10px 0' }}>Ask a Question</h1>
      <p className="sub" style={{ marginTop: 0 }}>
        Submit your question for review. If approved, it will appear in our FAQ library.
      </p>

      <section className="card" style={{ marginTop: 28 }}>
        <label htmlFor="qemail"><strong>Your Email</strong></label>
        <input
          id="qemail"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginTop: 8, padding: 8, width: '100%', maxWidth: 500 }}
          required
        />

        <label htmlFor="qtext" style={{ marginTop: 20, display: 'block' }}><strong>Your Question</strong></label>
        <textarea
          id="qtext"
          placeholder="Type your question (minimum 10 characters)..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ marginTop: 8, padding: 8, width: '100%', maxWidth: 500, display: 'block', boxSizing: 'border-box' }}
          rows={6}
        />

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
          <button type="button" onClick={submit} disabled={!canSubmit}>
            Submit
          </button>
          <button type="button" onClick={handleCancel} style={{ background: '#666' }}>
            Cancel
          </button>
        </div>

        {submitOk ? (
          <div className="success" style={{ marginTop: 20 }}>
            Thanks — your question was submitted for review.
          </div>
        ) : null}
        {submitErr ? (
          <div className="sub" style={{ marginTop: 20, color: '#b00020' }}>
            Submit failed: {submitErr}
          </div>
        ) : null}
      </section>

      <div style={{ marginTop: 24 }}>
        <Link href="/#faq" className="link">
          ← Back to FAQ
        </Link>
      </div>
    </main>
  );
}
