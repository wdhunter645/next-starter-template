'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/api';

type FAQItem = { 
  id: number; 
  question: string; 
  answer: string; 
  view_count: number;
  pinned: number;
  updated_at: string;
};

export default function FAQPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const q = useMemo(() => query.trim(), [query]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ ok: boolean; items: FAQItem[] }>(
        `/api/faq/list?limit=50&q=${encodeURIComponent(q)}`
      );
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const handleItemClick = async (id: number) => {
    // Toggle expansion
    const newExpandedId = expandedId === id ? null : id;
    setExpandedId(newExpandedId);
    
    // If expanding (not collapsing), increment view count
    if (newExpandedId === id) {
      try {
        await apiPost("/api/faq/view", { id });
      } catch {
        // Silently fail - view count is not critical
      }
    }
  };

  return (
    <main className="container" style={{ padding: '40px 16px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 10px 0' }}>FAQ – Frequently Asked Questions</h1>
      <p className="sub" style={{ marginTop: 0 }}>
        Browse all approved FAQ entries. Click a question to reveal the answer.
      </p>

      <section style={{ marginTop: 28 }}>
        <div className="faq" style={{ marginTop: 10 }}>
          <div className="search">
            <input 
              type="search" 
              placeholder="Search questions..." 
              aria-label="Search questions" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
            <button onClick={() => setQuery('')}>Clear</button>
          </div>

          {loading ? (
            <p className="sub">Loading…</p>
          ) : items.length === 0 ? (
            <p className="sub">No approved FAQs found.</p>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="q" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleItemClick(item.id)}
              >
                <strong>{item.question}</strong>
                {expandedId === item.id && (
                  <>
                    <br />
                    <span className="sub">{item.answer}</span>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <Link href="/ask" className="link" style={{ fontSize: 16 }}>
            Ask a Question
          </Link>
        </div>
      </section>
    </main>
  );
}
