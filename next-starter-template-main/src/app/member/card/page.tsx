
'use client';

import React, { useEffect, useMemo, useState } from 'react';

export default function MembershipCardPage() {
  const [content, setContent] = useState<{ title: string; body_md: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/membership-card');
        const data = await res.json();
        if (data?.ok && data?.content?.body_md) {
          setContent({ title: String(data.content.title || 'Membership Card'), body_md: String(data.content.body_md) });
        }
      } catch (e: unknown) {
        setErr(String((e as Error)?.message || e));
      }
    }
    load();
  }, []);

  const blocks = useMemo(() => {
    const md = content?.body_md || '';
    return md
      .split(/\n\s*\n/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [content]);

  return (
    <main style={{ padding: '40px 16px', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 12px 0' }}>{content?.title || 'Obtain Membership Card'}</h1>
      {blocks.length ? (
        <div style={{ marginTop: 12, padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
          {blocks.map((b, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '12px 0 0 0', lineHeight: 1.7 }}>
              {b}
            </p>
          ))}
        </div>
      ) : (
        <p style={{ opacity: 0.85, marginTop: 0 }}>
          Membership card content has not been published yet. An admin can publish it from /admin.
          {err ? ` (${err})` : ''}
        </p>
      )}
    </main>
  );
}
