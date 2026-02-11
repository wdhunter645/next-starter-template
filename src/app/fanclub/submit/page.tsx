'use client';

import { useEffect, useState } from 'react';

function getLocalEmail(): string {
  try { return window.localStorage.getItem('lgfc_member_email') || ''; } catch { return ''; }
}

export default function FanclubSubmitPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    setEmail(getLocalEmail());
  }, []);

  async function submit() {
    setMsg('');
    setBusy(true);
    try {
      const res = await fetch('/api/library/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: (email || '').trim(), title: title.trim(), content: content.trim() }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'submit_failed');
      setTitle('');
      setContent('');
      setMsg('Submitted. Thank you!');
    } catch (e: any) {
      setMsg(`Error: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  const can = !busy && name.trim().length >= 2 && (email || '').trim().length >= 5 && title.trim().length >= 3 && content.trim().length >= 20;

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '28px 16px' }}>
      <h1 style={{ fontSize: 32, margin: '0 0 8px 0' }}>Member Submissions</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Submit a short article or note to be considered for the Library. (PDF upload pipeline will be added as part of the media workflow.)
      </p>

      <section style={{ marginTop: 14, padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.14)' }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Submit an article</h2>

        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.2)' }}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.2)' }}
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.2)' }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your article text here…"
            rows={8}
            style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.2)', resize: 'vertical' }}
          />
          <button
            onClick={submit}
            disabled={!can}
            style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)', background: can ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', cursor: can ? 'pointer' : 'not-allowed' }}
          >
            {busy ? 'Submitting…' : 'Submit'}
          </button>
          {msg && <div style={{ marginTop: 6, opacity: 0.9 }}>{msg}</div>}
        </div>
      </section>
    </main>
  );
}
