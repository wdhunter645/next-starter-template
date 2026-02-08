'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';

type ContentBlock = {
  content: string | null;
  asset_url: string | null;
  updated_at?: string;
};

type Grouped = Record<string, Record<string, { live?: ContentBlock; draft?: ContentBlock }>>;

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function setStoredToken(t: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('lgfc_admin_token', t);
}

export default function AdminContentPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [slugs, setSlugs] = useState<string[]>([]);
  const [grouped, setGrouped] = useState<Grouped>({});
  const [slug, setSlug] = useState<string>('/');

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  async function load(targetSlug?: string) {
    const useSlug = (targetSlug ?? slug).trim();
    if (!token) {
      setStatus('Enter ADMIN_TOKEN to load content.');
      return;
    }
    setStatus('Loading...');
    const qs = useSlug ? `?slug=${encodeURIComponent(useSlug)}` : '';
    const res = await fetch(`/api/admin/content/list${qs}`, {
      headers: { 'x-admin-token': token },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setStatus(data?.error ? `Error: ${data.error}` : `Error: ${res.status}`);
      return;
    }
    setSlugs(data.slugs || (useSlug ? [useSlug] : []));
    setGrouped(data.grouped || {});
    setStatus('Loaded.');
  }

  const sections = useMemo(() => {
    const s = grouped?.[slug] || {};
    return Object.keys(s).sort().map((section) => ({
      section,
      live: s[section]?.live,
      draft: s[section]?.draft,
    }));
  }, [grouped, slug]);

  async function saveDraft(section: string, content: string, asset_url: string) {
    if (!token) return;
    setStatus(`Saving draft: ${slug} / ${section}...`);
    const res = await fetch('/api/admin/content/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ slug, section, content, asset_url }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setStatus(data?.error ? `Error: ${data.error}` : `Error: ${res.status}`);
      return;
    }
    await load(slug);
    setStatus('Draft saved.');
  }

  async function publish(section?: string) {
    if (!token) return;
    setStatus(section ? `Publishing section: ${section}...` : 'Publishing all drafts for page...');
    const res = await fetch('/api/admin/content/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ slug, section }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setStatus(data?.error ? `Error: ${data.error}` : `Error: ${res.status}`);
      return;
    }
    await load(slug);
    setStatus('Published.');
  }

  return (
    <PageShell title="Admin – Page Content" subtitle="Edit page_content sections stored in D1">
      <AdminNav />

    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admin • Page Content</h1>
      <p style={{ opacity: 0.9, lineHeight: 1.4 }}>
        Edit DB-backed content blocks in D1. This tool saves drafts and lets you publish them without redeploying.
      </p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr', marginTop: 16 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontWeight: 600 }}>ADMIN_TOKEN</span>
          <input
            value={token}
            onChange={(e) => {
              const v = e.target.value;
              setToken(v);
              setStoredToken(v);
            }}
            placeholder="Paste ADMIN_TOKEN (stored locally in this browser)"
            style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />
        </label>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
          <label style={{ display: 'grid', gap: 6, minWidth: 260 }}>
            <span style={{ fontWeight: 600 }}>Page (slug)</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="/about"
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
          </label>

          <button
            onClick={() => load(slug)}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}
          >
            Load
          </button>

          <button
            onClick={() => publish()}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}
          >
            Publish ALL drafts for this page
          </button>

          <span style={{ opacity: 0.85 }}>{status}</span>
        </div>
      </div>

      <hr style={{ margin: '20px 0' }} />

      {sections.length === 0 ? (
        <p style={{ opacity: 0.8 }}>No sections found for this slug. (Try loading / or /about.)</p>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {sections.map(({ section, live, draft }) => (
            <SectionEditor
              key={section}
              slug={slug}
              section={section}
              live={live}
              draft={draft}
              onSaveDraft={saveDraft}
              onPublishSection={() => publish(section)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionEditor({
  slug,
  section,
  live,
  draft,
  onSaveDraft,
  onPublishSection,
}: {
  slug: string;
  section: string;
  live?: ContentBlock;
  draft?: ContentBlock;
  onSaveDraft: (section: string, content: string, asset_url: string) => Promise<void>;
  onPublishSection: () => Promise<void>;
}) {
  const [content, setContent] = useState<string>(draft?.content ?? live?.content ?? '');
  const [assetUrl, setAssetUrl] = useState<string>(draft?.asset_url ?? live?.asset_url ?? '');

  useEffect(() => {
    setContent(draft?.content ?? live?.content ?? '');
    setAssetUrl(draft?.asset_url ?? live?.asset_url ?? '');
  }, [draft?.content, live?.content, draft?.asset_url, live?.asset_url]);

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 14, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 800 }}>{slug} • {section}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Live updated: {live?.updated_at || '—'} • Draft updated: {draft?.updated_at || '—'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onSaveDraft(section, content, assetUrl)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}
          >
            Save Draft
          </button>
          <button
            onClick={onPublishSection}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}
          >
            Publish Section
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Asset URL (optional)</span>
          <input
            value={assetUrl}
            onChange={(e) => setAssetUrl(e.target.value)}
            placeholder="https://.../image.jpg"
            style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Content (HTML or plain text)</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
          />
        </label>

        <details>
          <summary style={{ cursor: 'pointer' }}>Preview (renders as HTML)</summary>
          <div style={{ padding: 12, border: '1px dashed #bbb', borderRadius: 10, marginTop: 8 }}
               dangerouslySetInnerHTML={{ __html: content || '' }} />
        </details>
      </div>
    </section>
    </PageShell>
  );
}
