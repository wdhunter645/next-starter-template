'use client';

import { useState } from 'react';

export default function PostCreation({ onPostCreated }: { onPostCreated?: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = title.trim().length >= 3 && body.trim().length >= 5 && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const res = await fetch('/api/discussions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'create_failed');
      setTitle('');
      setBody('');
      onPostCreated?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="Post creation"
      style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.72)' }}
    >
      <h2 style={{ margin: 0, fontSize: 20 }}>Create a post</h2>
      <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)' }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
          rows={4}
          style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)', resize: 'vertical' }}
        />
        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.2)', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
        >
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
    </section>
  );
}
