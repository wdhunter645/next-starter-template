'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type ContentBlock = {
  key: string;
  page: string;
  section: string;
  title: string;
  status: 'draft' | 'published';
  version: number;
  body_md: string;
  published_body_md: string | null;
  updated_at: string;
  published_at: string | null;
  updated_by?: string;
};

type Revision = {
  id: number;
  key: string;
  version: number;
  body_md: string;
  status: string;
  updated_at: string;
  updated_by: string;
};

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function setStoredToken(t: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('lgfc_admin_token', t);
}

export default function AdminCMSEditorPage() {
  const params = useParams();
  const key = decodeURIComponent(params?.key as string || '');

  const [token, setToken] = useState('');
  const [block, setBlock] = useState<ContentBlock | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [title, setTitle] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  useEffect(() => {
    if (token && key) {
      loadBlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, key]);

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setBodyMd(block.body_md || '');
    }
  }, [block]);

  async function loadBlock() {
    if (!token || !key) return;

    setLoading(true);
    setStatus('Loading...');

    try {
      const res = await fetch(`/api/admin/cms/${encodeURIComponent(key)}`, {
        headers: { 'x-admin-token': token },
      });
      
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus(data?.error || `Error: ${res.status}`);
        return;
      }

      setBlock(data.block);
      setRevisions(data.revisions || []);
      setStatus(`Loaded block: ${data.block.key}`);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  async function renderPreview() {
    if (!bodyMd) {
      setPreviewHtml('<p style="opacity:0.6">No content to preview</p>');
      return;
    }

    try {
      // Use dynamic import for markdown rendering on client side
      const { renderMarkdownPreview } = await import('@/lib/markdown');
      const html = renderMarkdownPreview(bodyMd);
      setPreviewHtml(html);
    } catch (err) {
      setPreviewHtml(`<p style="color:red">Preview error: ${err instanceof Error ? err.message : 'Unknown error'}</p>`);
    }
  }

  useEffect(() => {
    if (showPreview) {
      renderPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview, bodyMd]);

  async function saveDraft() {
    if (!token || !key) return;

    setStatus('Saving draft...');
    try {
      const res = await fetch(`/api/admin/cms/${encodeURIComponent(key)}/save-draft`, {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body_md: bodyMd }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus(`Error: ${data?.error || res.status}`);
        return;
      }

      setStatus(`Draft saved! Version: ${data.version}`);
      await loadBlock();
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async function publish() {
    if (!token || !key) return;
    if (!confirm('Publish this content? It will be visible to the public.')) return;

    setStatus('Publishing...');
    try {
      const res = await fetch(`/api/admin/cms/${encodeURIComponent(key)}/publish`, {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body_md: bodyMd }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus(`Error: ${data?.error || res.status}`);
        return;
      }

      setStatus(`Published! Version: ${data.version}`);
      await loadBlock();
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async function unpublish() {
    if (!token || !key) return;
    if (!confirm('Unpublish this content? It will be removed from public view.')) return;

    setStatus('Unpublishing...');
    try {
      const res = await fetch(`/api/admin/cms/${encodeURIComponent(key)}/unpublish`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus(`Error: ${data?.error || res.status}`);
        return;
      }

      setStatus('Unpublished successfully');
      await loadBlock();
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async function revertToPublished() {
    if (!block?.published_body_md) {
      alert('No published version to revert to');
      return;
    }
    if (!confirm('Revert draft to published version?')) return;

    setBodyMd(block.published_body_md);
    setStatus('Reverted to published version (not saved yet)');
  }

  async function rollbackToRevision(version: number) {
    if (!token || !key) return;
    if (!confirm(`Rollback published content to version ${version}?`)) return;

    setStatus('Rolling back...');
    try {
      const res = await fetch(`/api/admin/cms/${encodeURIComponent(key)}/rollback`, {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus(`Error: ${data?.error || res.status}`);
        return;
      }

      setStatus(`Rolled back to version ${version}! New version: ${data.version}`);
      await loadBlock();
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  if (!key) {
    return <div style={{ padding: 24 }}>Invalid block key</div>;
  }

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/cms" style={{ color: '#0070f3', textDecoration: 'none' }}>
          ← Back to CMS List
        </Link>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Edit Content Block</h1>
      <p style={{ opacity: 0.9, lineHeight: 1.4, marginBottom: 24, fontFamily: 'monospace' }}>
        {key}
      </p>

      {!token && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>ADMIN_TOKEN</span>
            <input
              type="password"
              value={token}
              onChange={(e) => {
                const v = e.target.value;
                setToken(v);
                setStoredToken(v);
              }}
              placeholder="Paste ADMIN_TOKEN"
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: '1px solid #ccc',
                fontFamily: 'monospace'
              }}
            />
          </label>
        </div>
      )}

      {status && (
        <div style={{ 
          padding: 12, 
          background: '#f5f5f5', 
          borderRadius: 8,
          fontSize: 14,
          marginBottom: 16
        }}>
          {status}
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : !block ? (
        <div>Block not found or not loaded. Check ADMIN_TOKEN.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 16,
              padding: 16,
              background: '#f9f9f9',
              borderRadius: 8
            }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Status</div>
                <div style={{ fontWeight: 600 }}>{block.status}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Version</div>
                <div style={{ fontWeight: 600 }}>{block.version}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Updated</div>
                <div style={{ fontSize: 14 }}>{new Date(block.updated_at).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Published</div>
                <div style={{ fontSize: 14 }}>
                  {block.published_at ? new Date(block.published_at).toLocaleString() : '—'}
                </div>
              </div>
            </div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ 
                  padding: 10, 
                  borderRadius: 8, 
                  border: '1px solid #ccc',
                  fontSize: 16
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Markdown Content</span>
              <textarea
                value={bodyMd}
                onChange={(e) => setBodyMd(e.target.value)}
                rows={20}
                style={{ 
                  padding: 12, 
                  borderRadius: 8, 
                  border: '1px solid #ccc',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 14,
                  lineHeight: 1.6
                }}
              />
            </label>

            <div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 8, 
                  border: '1px solid #ccc',
                  background: showPreview ? '#0070f3' : '#fff',
                  color: showPreview ? '#fff' : '#000',
                  cursor: 'pointer'
                }}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {showPreview && (
              <div style={{ 
                padding: 16, 
                border: '1px solid #ddd', 
                borderRadius: 8,
                background: '#fff',
                minHeight: 200
              }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  marginBottom: 12,
                  opacity: 0.7
                }}>
                  Preview (Rendered Markdown)
                </div>
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: 12, 
            flexWrap: 'wrap',
            marginBottom: 32,
            padding: 16,
            background: '#f9f9f9',
            borderRadius: 8
          }}>
            <button
              onClick={saveDraft}
              style={{ 
                padding: '12px 24px', 
                borderRadius: 8, 
                border: '1px solid #333',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Save Draft
            </button>
            <button
              onClick={publish}
              style={{ 
                padding: '12px 24px', 
                borderRadius: 8, 
                border: 'none',
                background: '#0070f3',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Publish
            </button>
            {block.status === 'published' && (
              <button
                onClick={unpublish}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: 8, 
                  border: '1px solid #dc3545',
                  background: '#fff',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Unpublish
              </button>
            )}
            {block.published_body_md && (
              <button
                onClick={revertToPublished}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: 8, 
                  border: '1px solid #6c757d',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                Revert Draft to Published
              </button>
            )}
          </div>

          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
              Revision History ({revisions.length})
            </h2>
            {revisions.length === 0 ? (
              <div style={{ opacity: 0.7, padding: 16 }}>No revisions yet</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {revisions.map(rev => (
                  <div 
                    key={rev.id}
                    style={{ 
                      padding: 16, 
                      border: '1px solid #ddd', 
                      borderRadius: 8,
                      background: '#fff'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, marginRight: 12 }}>
                          Version {rev.version}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          background: rev.status === 'published' ? '#d4edda' : '#fff3cd',
                          color: rev.status === 'published' ? '#155724' : '#856404'
                        }}>
                          {rev.status}
                        </span>
                      </div>
                      {rev.status === 'published' && (
                        <button
                          onClick={() => rollbackToRevision(rev.version)}
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: 6, 
                            border: '1px solid #0070f3',
                            background: '#fff',
                            color: '#0070f3',
                            cursor: 'pointer',
                            fontSize: 13
                          }}
                        >
                          Rollback to This
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
                      {new Date(rev.updated_at).toLocaleString()} by {rev.updated_by}
                    </div>
                    <details>
                      <summary style={{ cursor: 'pointer', fontSize: 14 }}>
                        View content
                      </summary>
                      <pre style={{ 
                        marginTop: 8,
                        padding: 12,
                        background: '#f5f5f5',
                        borderRadius: 4,
                        fontSize: 12,
                        overflow: 'auto',
                        maxHeight: 200
                      }}>
                        {rev.body_md}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
