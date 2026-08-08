'use client';

import { useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';
import styles from './page.module.css';

export default function FanclubSubmitPage() {
  const { isLoading, isAuthenticated, email } = useMemberSession({ redirectTo: '/' });
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  async function submit() {
    setMsg('');
    setBusy(true);
    try {
      const res = await fetch('/api/library/submit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), title: title.trim(), content: content.trim() }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'submit_failed');
      setTitle('');
      setContent('');
      setMsg('Submitted. Thank you!');
    } catch (e: unknown) {
      const text = e instanceof Error ? e.message : String(e);
      setMsg(`Error: ${text}`);
    } finally {
      setBusy(false);
    }
  }

  const can = !busy && name.trim().length >= 2 && email.trim().length >= 5 && title.trim().length >= 3 && content.trim().length >= 20;

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Member Submissions</h1>
      <p className={styles.lead}>
        Submit a short article or note to be considered for the Library. (PDF upload pipeline will be added as part of the media workflow.)
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Submit an article</h2>

        <div className={styles.formGrid}>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <input
            className={styles.inputReadonly}
            value={email}
            readOnly
            placeholder="Your email"
          />
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
          />
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your article text here…"
            rows={8}
          />
          <button className={styles.button} onClick={submit} disabled={!can}>
            {busy ? 'Submitting…' : 'Submit'}
          </button>
          {msg ? <div className={styles.message}>{msg}</div> : null}
        </div>
      </section>
    </main>
  );
}
