'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PageShell from '@/components/PageShell';

/**
 * Admin → Content
 * This page intentionally prioritizes "compile-safe" behavior for Cloudflare Pages.
 * It calls API routes if/when they exist, but will still render cleanly if they 404.
 */

type ContentBlock = {
  slug: string;
  section: string;
  content: string;
  asset_url: string;
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

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: string };
type ApiResp<T> = ApiOk<T> | ApiErr;

async function safeJson<T>(res: Response): Promise<ApiResp<T>> {
  try {
    const j = (await res.json()) as unknown;
    // minimal runtime validation: accept {ok:true,data:*} or {ok:false,error:*}
    if (
      typeof j === 'object' &&
      j !== null &&
      'ok' in j &&
      typeof (j as { ok: unknown }).ok === 'boolean'
    ) {
      return j as ApiResp<T>;
    }
    return { ok: false, error: 'Unexpected API response shape.' };
  } catch {
    return { ok: false, error: 'Failed to parse JSON response.' };
  }
}

export default function AdminContentPage() {
  const [slug, setSlug] = useState<string>('/');
  const [status, setStatus] = useState<string>('Idle.');
  const [loading, setLoading] = useState<boolean>(false);
  const [sections, setSections] = useState<SectionBundle[]>([]);

  const apiBase = useMemo(() => '/api/admin/content', []);

  const load = useCallback(
    async (nextSlug?: string) => {
      const target = (nextSlug ?? slug).trim() || '/';
      setLoading(true);
      setStatus(`Loading sections for "${target}"...`);

      try {
        const res = await fetch(`${apiBase}?slug=${encodeURIComponent(target)}`, {
          method: 'GET',
          headers: { 'content-type': 'application/json' },
          cache: 'no-store',
        });

        if (!res.ok) {
          setSections([]);
          setStatus(`API not available (HTTP ${res.status}). Page compiled OK.`);
          return;
        }

        const parsed = await safeJson<SectionBundle[]>(res);
        if (!parsed.ok) {
          setSections([]);
          setStatus(`API error: ${parsed.error}`);
          return;
        }

        setSections(parsed.data);
        setStatus(`Loaded ${parsed.data.length} section(s) for "${target}".`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setSections([]);
        setStatus(`Network error: ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [apiBase, slug]
  );

  const saveDraft = useCallback(
    async (section: string, contentValue: string, assetUrl: string) => {
      const target = slug.trim() || '/';
      setStatus(`Saving draft: ${target} → ${section}...`);

      try {
        const res = await fetch(`${apiBase}/draft`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            slug: target,
            section,
            content: contentValue,
            asset_url: assetUrl,
          }),
        });

        if (!res.ok) {
          setStatus(`Draft save failed (HTTP ${res.status}).`);
          return;
        }

        const parsed = await safeJson<{ saved: boolean }>(res);
        if (!parsed.ok) {
          setStatus(`Draft save error: ${parsed.error}`);
          return;
        }

        setStatus('Draft saved.');
        await load(target);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setStatus(`Draft save network error: ${msg}`);
      }
    },
    [apiBase, load, slug]
  );

  const publish = useCallback(
    async (section: string) => {
      const target = slug.trim() || '/';
      setStatus(`Publishing: ${target} → ${section}...`);

      try {
        const res = await fetch(`${apiBase}/publish`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ slug: target, section }),
        });

        if (!res.ok) {
          setStatus(`Publish failed (HTTP ${res.status}).`);
          return;
        }

        const parsed = await safeJson<{ published: boolean }>(res);
        if (!parsed.ok) {
          setStatus(`Publish error: ${parsed.error}`);
          return;
        }

        setStatus('Published.');
        await load(target);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setStatus(`Publish network error: ${msg}`);
      }
    },
    [apiBase, load, slug]
  );

  useEffect(() => {
    // default load once
    void load('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell title="Admin Content" subtitle="Edit site sections backed by D1 (when configured).">
      <div style={{ display: 'grid', gap: 14 }}>
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
            }}
          >
            {loading ? 'Loading…' : 'Load'}
          </button>

          <span style={{ opacity: 0.85 }}>{status}</span>
        </div>

        <hr style={{ margin: '8px 0' }} />

        {sections.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No sections returned. (API may be 404 or slug has no rows.)</p>
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
  onSaveDraft: (section: string, content: string, asset_url: string) => Promise<void>;
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
      await onSaveDraft(section, content, assetUrl);
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
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        />
      </label>
    </div>
  );
}
