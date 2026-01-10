'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type ContentBlock = {
  key: string;
  page: string;
  section: string;
  title: string;
  status: 'draft' | 'published';
  version: number;
  updated_at: string;
  published_at: string | null;
  updated_by?: string;
};

const PAGES = ['home', 'about', 'charities', 'events', 'library', 'photos', 'memorabilia', 'join'];

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function setStoredToken(t: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('lgfc_admin_token', t);
}

export default function AdminCMSListPage() {
  const [token, setToken] = useState('');
  const [page, setPage] = useState('home');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  async function loadBlocks() {
    if (!token) {
      setStatus('Enter ADMIN_TOKEN to load content.');
      return;
    }

    setLoading(true);
    setStatus('Loading...');

    try {
      const res = await fetch(`/api/admin/cms?page=${encodeURIComponent(page)}`, {
        headers: { 'x-admin-token': token },
      });
      
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus(data?.error || `Error: ${res.status}`);
        setBlocks([]);
        return;
      }

      setBlocks(data.blocks || []);
      setStatus(`Loaded ${data.blocks?.length || 0} blocks for page: ${page}`);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && page) {
      loadBlocks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token]);

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ color: '#0070f3', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>CMS Content Blocks</h1>
      <p style={{ opacity: 0.9, lineHeight: 1.4, marginBottom: 24 }}>
        Manage page content blocks with markdown. Draft and publish workflow with revision history.
      </p>

      <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
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

        <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <label style={{ display: 'grid', gap: 6, flex: 1 }}>
            <span style={{ fontWeight: 600 }}>Filter by Page</span>
            <select
              value={page}
              onChange={(e) => setPage(e.target.value)}
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: '1px solid #ccc',
                fontSize: 14
              }}
            >
              {PAGES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <button
            onClick={loadBlocks}
            disabled={loading || !token}
            style={{ 
              padding: '10px 20px', 
              borderRadius: 8, 
              border: '1px solid #333',
              background: loading ? '#eee' : '#fff',
              cursor: loading || !token ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Reload'}
          </button>
        </div>

        {status && (
          <div style={{ 
            padding: 12, 
            background: '#f5f5f5', 
            borderRadius: 8,
            fontSize: 14,
            opacity: 0.9
          }}>
            {status}
          </div>
        )}
      </div>

      {blocks.length === 0 ? (
        <div style={{ 
          padding: 40, 
          textAlign: 'center', 
          border: '1px dashed #ccc',
          borderRadius: 8,
          opacity: 0.7
        }}>
          {token ? 'No blocks found for this page.' : 'Enter ADMIN_TOKEN to view content blocks.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: '1px solid #ddd',
            borderRadius: 8
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Key</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Title</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Updated</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Published</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map(block => (
                <tr key={block.key} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12, fontSize: 13, fontFamily: 'monospace' }}>
                    {block.key}
                  </td>
                  <td style={{ padding: 12 }}>{block.title}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      background: block.status === 'published' ? '#d4edda' : '#fff3cd',
                      color: block.status === 'published' ? '#155724' : '#856404'
                    }}>
                      {block.status}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13 }}>
                    {new Date(block.updated_at).toLocaleString()}
                  </td>
                  <td style={{ padding: 12, fontSize: 13 }}>
                    {block.published_at ? new Date(block.published_at).toLocaleString() : '—'}
                  </td>
                  <td style={{ padding: 12 }}>
                    <Link
                      href={`/admin/cms/${encodeURIComponent(block.key)}`}
                      style={{
                        color: '#0070f3',
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: 500
                      }}
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
