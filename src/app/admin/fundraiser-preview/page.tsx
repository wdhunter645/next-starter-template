'use client';

import { useEffect, useMemo, useState } from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';
import CampaignSpotlightCard from '@/components/home/CampaignSpotlightCard';
import {
  CAMPAIGN_SPOTLIGHT_KEY,
  CAMPAIGN_SPOTLIGHT_PAGE,
  CAMPAIGN_SPOTLIGHT_SECTION,
  CAMPAIGN_SPOTLIGHT_TITLE,
  defaultCampaignSpotlightConfig,
  parseCampaignSpotlightConfig,
  serializeCampaignSpotlightConfig,
  type CampaignSpotlightConfig,
  validateCampaignSpotlightConfig,
} from '@/lib/campaignSpotlight';

type Block = {
  key: string;
  body_md: string;
  published_body_md: string | null;
  version: number;
  status: 'draft' | 'published';
  updated_at: string;
  published_at: string | null;
  updated_by: string;
};

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function emptyBlock(): Block | null {
  return null;
}

export default function FundraiserPreviewPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Idle');
  const [block, setBlock] = useState<Block | null>(emptyBlock());
  const [form, setForm] = useState<CampaignSpotlightConfig>(defaultCampaignSpotlightConfig);

  useEffect(() => {
    setToken(getToken());
  }, []);

  async function load() {
    if (!token) {
      setStatus('Missing admin token. Set the token from /admin first.');
      return;
    }

    setStatus('Loading preview data...');
    const res = await fetch(`/api/admin/cms/list?page=${encodeURIComponent(CAMPAIGN_SPOTLIGHT_PAGE)}`, {
      headers: { 'x-admin-token': token },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok !== true) {
      setStatus(data?.error ? `Error: ${data.error}` : `Error: HTTP ${res.status}`);
      return;
    }

    const found = Array.isArray(data.blocks)
      ? (data.blocks.find((item: Block) => item.key === CAMPAIGN_SPOTLIGHT_KEY) as Block | undefined)
      : undefined;

    if (!found) {
      setBlock(null);
      setForm(defaultCampaignSpotlightConfig);
      setStatus('No campaign spotlight block exists yet. Starter data loaded locally. Save Draft to create it.');
      return;
    }

    setBlock(found);
    const parsed = parseCampaignSpotlightConfig(found.body_md) || defaultCampaignSpotlightConfig;
    setForm(parsed);
    setStatus('Loaded');
  }

  useEffect(() => {
    if (token) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const validationErrors = useMemo(() => validateCampaignSpotlightConfig(form), [form]);
  const publishedConfig = useMemo(() => parseCampaignSpotlightConfig(block?.published_body_md || null), [block?.published_body_md]);
  const publishedErrors = useMemo(() => validateCampaignSpotlightConfig(publishedConfig), [publishedConfig]);

  function updateField<K extends keyof CampaignSpotlightConfig>(key: K, value: CampaignSpotlightConfig[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveDraft() {
    if (!token) {
      setStatus('Missing admin token.');
      return;
    }
    if (validationErrors.length > 0) {
      setStatus('Draft not saved. Fix validation errors first.');
      return;
    }

    setStatus('Saving draft...');
    const res = await fetch('/api/admin/cms/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({
        key: CAMPAIGN_SPOTLIGHT_KEY,
        page: CAMPAIGN_SPOTLIGHT_PAGE,
        section: CAMPAIGN_SPOTLIGHT_SECTION,
        title: CAMPAIGN_SPOTLIGHT_TITLE,
        body_md: serializeCampaignSpotlightConfig(form),
        updated_by: 'admin-fundraiser-preview',
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok !== true) {
      setStatus(data?.error ? `Error: ${data.error}` : `Error: HTTP ${res.status}`);
      return;
    }

    await load();
    setStatus(`Draft saved. Version ${data.version}.`);
  }

  async function publish() {
    if (!token) {
      setStatus('Missing admin token.');
      return;
    }
    if (validationErrors.length > 0) {
      setStatus('Publish blocked. Fix validation errors first.');
      return;
    }

    if (block?.body_md !== serializeCampaignSpotlightConfig(form)) {
      setStatus('Publish blocked. Save Draft first so the published version matches the current preview.');
      return;
    }

    setStatus('Publishing...');
    const res = await fetch('/api/admin/cms/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ key: CAMPAIGN_SPOTLIGHT_KEY, updated_by: 'admin-fundraiser-preview' }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok !== true) {
      setStatus(data?.error ? `Error: ${data.error}` : `Error: HTTP ${res.status}`);
      return;
    }

    await load();
    setStatus(`Published successfully. Version ${data.version}.`);
  }

  return (
    <PageShell
      title="Admin – Fundraiser Preview"
      subtitle="Build and validate the temporary homepage campaign spotlight inside the gated admin area before enabling it publicly."
    >
      <AdminNav />

      <div style={{ display: 'grid', gap: 18 }}>
        <section style={{ border: '1px solid #ddd', borderRadius: 16, padding: 18, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Campaign Spotlight Control</h2>
              <p style={{ margin: '8px 0 0 0', opacity: 0.85 }}>
                Homepage placement is fixed between the Hero Banner and Weekly Matchup. When disabled, the homepage renders as if the section does not exist.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => void load()} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #222', cursor: 'pointer', background: '#fff' }}>Refresh</button>
              <button onClick={() => void saveDraft()} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #222', cursor: 'pointer', background: '#fff' }}>Save Draft</button>
              <button onClick={() => void publish()} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #0033cc', cursor: 'pointer', background: '#0033cc', color: '#fff' }}>Publish</button>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700 }}>{status}</div>
          <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>
            <div><strong>CMS key:</strong> <code>{CAMPAIGN_SPOTLIGHT_KEY}</code></div>
            <div><strong>Enable flow:</strong> Save Draft → Publish → homepage section appears.</div>
            <div><strong>Archive flow:</strong> set Enabled to off → Save Draft → Publish. Prior published states remain in <code>content_revisions</code>.</div>
            <div><strong>Development route:</strong> <code>/admin/fundraiser-preview</code></div>
          </div>
        </section>

        <section style={{ border: '1px solid #ddd', borderRadius: 16, padding: 18, background: '#fff' }}>
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Current Block Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div><strong>Draft version:</strong> {block?.version ?? '(new)'}</div>
            <div><strong>Draft status:</strong> {block?.status ?? 'not created'}</div>
            <div><strong>Updated at:</strong> {block?.updated_at ?? '(not yet saved)'}</div>
            <div><strong>Published at:</strong> {block?.published_at ?? '(never)'}</div>
          </div>
          {publishedConfig && publishedErrors.length === 0 ? (
            <p style={{ marginTop: 12, marginBottom: 0, color: '#184d12', fontWeight: 700 }}>
              Published snapshot is valid and currently {publishedConfig.enabled ? 'eligible to render on the homepage.' : 'hidden because Enabled is off.'}
            </p>
          ) : (
            <p style={{ marginTop: 12, marginBottom: 0, color: '#7a4b00', fontWeight: 700 }}>
              No valid published snapshot is currently available for the homepage.
            </p>
          )}
        </section>

        <section style={{ border: '1px solid #ddd', borderRadius: 16, padding: 18, background: '#fff' }}>
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Editor</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Eyebrow</span>
              <input value={form.eyebrow} onChange={(e) => updateField('eyebrow', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Badge</span>
              <input value={form.badge} onChange={(e) => updateField('badge', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Title</span>
              <input value={form.title} onChange={(e) => updateField('title', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Deadline label</span>
              <input value={form.deadlineLabel} onChange={(e) => updateField('deadlineLabel', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Primary CTA label</span>
              <input value={form.primaryCtaLabel} onChange={(e) => updateField('primaryCtaLabel', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Primary CTA href</span>
              <input value={form.primaryCtaHref} onChange={(e) => updateField('primaryCtaHref', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Secondary CTA label</span>
              <input value={form.secondaryCtaLabel} onChange={(e) => updateField('secondaryCtaLabel', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Secondary CTA href</span>
              <input value={form.secondaryCtaHref} onChange={(e) => updateField('secondaryCtaHref', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Progress label</span>
              <input value={form.progressLabel} onChange={(e) => updateField('progressLabel', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Goal amount</span>
              <input value={form.goalAmount} onChange={(e) => updateField('goalAmount', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Raised amount</span>
              <input value={form.raisedAmount} onChange={(e) => updateField('raisedAmount', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Supporter count</span>
              <input value={form.supporterCount} onChange={(e) => updateField('supporterCount', e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
            </label>
          </div>

          <label style={{ display: 'grid', gap: 6, marginTop: 14 }}>
            <span>Description</span>
            <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={4} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          </label>

          <label style={{ display: 'grid', gap: 6, marginTop: 14 }}>
            <span>Note</span>
            <textarea value={form.note} onChange={(e) => updateField('note', e.target.value)} rows={3} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          </label>

          <label style={{ display: 'grid', gap: 6, marginTop: 14 }}>
            <span>Archive label</span>
            <textarea value={form.archiveLabel} onChange={(e) => updateField('archiveLabel', e.target.value)} rows={2} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, fontWeight: 700 }}>
            <input type="checkbox" checked={form.enabled} onChange={(e) => updateField('enabled', e.target.checked)} />
            Enabled for homepage rendering after publish
          </label>

          {validationErrors.length > 0 ? (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: '1px solid #e7b8b8', background: '#fff7f7' }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Validation errors</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {validationErrors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            </div>
          ) : (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: '1px solid #cde4cf', background: '#f6fff6', fontWeight: 700 }}>
              Draft is valid for preview and publish.
            </div>
          )}
        </section>

        <section style={{ display: 'grid', gap: 16 }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 22 }}>Admin Preview</h2>
            <CampaignSpotlightCard config={form} previewLabel="Local Draft Preview" />
          </div>

          {publishedConfig && publishedErrors.length === 0 ? (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 22 }}>Published Snapshot</h2>
              <CampaignSpotlightCard config={publishedConfig} previewLabel={publishedConfig.enabled ? 'Homepage Eligible' : 'Published Hidden State'} />
            </div>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
