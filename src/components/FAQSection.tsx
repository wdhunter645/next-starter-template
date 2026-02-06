"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

type FAQItem = {
  id: number;
  question: string;
  answer: string;
  view_count: number;
  pinned: number;
  updated_at: string;
};

export default function FAQSection() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let alive = true;
    let completed = false;
    
    const timer = setTimeout(() => {
      if (alive && !completed) {
        setLoading(false);
        setItems([]);
      }
    }, 10000); // 10 second timeout
    
    (async () => {
      try {
        // When search is empty, show Top 5 FAQs
        // When search has text, show up to 10 matching FAQs
        const limit = query ? 10 : 5;
        const data = await apiGet<{ ok: boolean; items: FAQItem[] }>(
          `/api/faq/list?limit=${limit}${query ? `&q=${encodeURIComponent(query)}` : ""}`
        );
        if (alive) setItems(data.items || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) {
          setLoading(false);
          completed = true;
        }
      }
    })();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);

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
    <div>
      <h2 className="section-title">FAQ – Frequently Asked Questions</h2>
      <p className="sub">
        Search our FAQ or browse the top questions below.
      </p>

      <div className="faq">
        <div className="search">
          <input
            id="faqSearch"
            type="search"
            placeholder="Search questions..."
            aria-label="Search questions"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button id="faqClear" onClick={() => setQ("")}>Clear</button>
        </div>

        <div id="faqList">
          {loading ? (
            <p className="sub">Loading FAQ…</p>
          ) : items.length === 0 ? (
            <p className="sub">No matching FAQ answers found.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="q" style={{ cursor: 'pointer' }} onClick={() => handleItemClick(item.id)}>
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

        {query && items.length > 0 && (
          <p className="sub" style={{ marginTop: 16 }}>
            <Link className="link" href={`/faq?q=${encodeURIComponent(query)}`}>View all results</Link>
          </p>
        )}

        <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/faq" className="btn" style={{ textDecoration: 'none' }}>
            Open the FAQ Library
          </Link>
          <Link href="/ask" className="link" style={{ fontSize: 16 }}>
            Ask a Question
          </Link>
        </div>
      </div>
    </div>
  );
}
