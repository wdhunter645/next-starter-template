'use client';

import React, { useCallback, useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';
import AdminTokenPanel from '@/components/admin/AdminTokenPanel';
import { adminJson } from '@/lib/adminClient';

type ContentBlock = {
  slug: string;
  section: string;
  content: string | null;
  asset_url: string | null;
  updated_at?: string;
};

type ContentDraft = ContentBlock & {
  status?: 'draft';
};

type SectionBundle = {
  section: string;
  live?: ContentBlock;
  draft?: ContentDraft;
};

type ListResponse = {
  ok: true;
  slugs: string[];
  grouped: Record<string, Record<string, { live?: ContentBlock; draft?: ContentDraft }>>;
};

export default function AdminContentPage() {
  const [slug, setSlug] = useState<string>('/');
  const [status, setStatus] = useState<string>('Idle.');
  const [loading, setLoading] = useState<boolean>(false);
  const [sections, setSections] = useState<SectionBundle[]>([]);

  const load = useCallback(async (nextSlug?: string) => {
    const target = (nextSlug ?? slug).trim() || '/';
    setLoading(true);
    setStatus(`Loading sections for "${target}"...`);

    const result = await adminJson<ListResponse>(
      `/api/admin/content/list?slug=${encodeURIComponent(target)}`,
    );

    if (!result.ok) {
      setSections([]);
      setStatus(`Error: ${result.error}`);
      setLoading(false);
      return;
    }

    const grouped = result.data?.grouped ?? {};
    const targetData = grouped[target] ?? {};
    const bundles: SectionBundle[] = Object.entries(targetData).map(([section, data]) => ({
      section,
      live: data.live,
      draft: data.draft,
    }));

    setSections(bundles);
    setStatus(`Loaded ${bundles.length} section(s) for "${target}".`);
    setLoading(false);
  }, [slug]);

  const saveDraft = useCallback(
    async (section: string, contentValue: string | null, assetUrl: string | null) => {
      const target = slug.trim() || '/';
      setStatus(`Saving draft: ${target} → ${section}...`);

      const result = await adminJson<{ ok: true }>('/api/admin/content/save', {
        method: 'POST',
        body: JSON.stringify({
          slug: target,
          section,
          content: contentValue,
          asset_url: assetUrl,
        }),
      });

      if (!result.ok) {
        setStatus(`Draft save error: ${result.error}`);
        return;
      }

      setStatus('Draft saved.');
      await load(target);
    },
    [load, slug],
  );

  const publish = useCallback(
    async (section: string) => {
      const target = slug.trim() || '/';
      setStatus(`Publishing: ${target} → ${section}...`);

      const result = await adminJson<{ ok: true }>('/api/admin/content/publish', {
        method: 'POST',
        body: JSON.stringify({ slug: target, section }),
      });

      if (!result.ok) {
        setStatus(`Publish error: ${result.error}`);
        return;
      }

      setStatus('Published.');
      await load(target);
    },
    [load, slug],
  );

  useEffect(() => {
    void load('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell title="Admin Content" subtitle="Edit site sections backed by D1 (when configured).">
      <AdminNav />
      <AdminTokenPanel onSaved={() => void load(slug || '/')} />

      <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="/"
              style={{
                padding: '10px 12px',
                minWidth: 240,
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.15)',
              }}
            />
          </label>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.15)',
              background: loading ? 'rgba(0,0,0,0.05)' : 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-end',
            }}
          >
            {loading ? 'Loading…' : 'Load'}
          </button>

          <span style={{ opacity: 0.85, alignSelf: 'flex-end', paddingBottom: 4 }}>{status}</span>
        </div>

        <hr style={{ margin: '4px 0' }} />

        {sections.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No sections returned. (API may be unavailable or slug has no rows.)</p>
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
                onPublishSection={() => void publish(section)}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function SectionEditor(props: {
  slug: string;
  section: string;
  live?: ContentBlock;
  draft?: ContentDraft;
  onSaveDraft: (section: string, content: string | null, asset_url: string | null) => Promise<void>;
  onPublishSection: () => void;
}) {
  const { section, live, draft, onSaveDraft, onPublishSection } = props;

  const [content, setContent] = useState<string>(draft?.content ?? live?.content ?? '');
  const [assetUrl, setAssetUrl] = useState<string>(draft?.asset_url ?? live?.asset_url ?? '');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setContent(draft?.content ?? live?.content ?? '');
    setAssetUrl(draft?.asset_url ?? live?.asset_url ?? '');
  }, [draft?.content, live?.content, draft?.asset_url, live?.asset_url]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await onSaveDraft(section, content || null, assetUrl || null);
    } finally {
      setSaving(false);
    }
  }, [assetUrl, content, onSaveDraft, section]);

  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 14,
        padding: 14,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{section}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Live updated: {live?.updated_at ?? '—'} · Draft: {draft ? 'present' : '—'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.15)',
              background: saving ? 'rgba(0,0,0,0.05)' : 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={onPublishSection}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.15)',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Publish
          </button>
        </div>
      </div>

      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 12, opacity: 0.85 }}>Asset URL (optional)</span>
        <input
          value={assetUrl}
          onChange={(e) => setAssetUrl(e.target.value)}
          placeholder="https://…"
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.15)',
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 12, opacity: 0.85 }}>Content</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.15)',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        />
      </label>
    </div>
  );
}
