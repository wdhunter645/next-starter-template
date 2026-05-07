'use client';

import { useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type FAQItem = {
  id: number;
  question: string;
  answer: string;
  pinned?: boolean;
  view_count?: number;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: 'How do I join the fan club?',
    answer:
      'Visit the Join Fanclub page, choose your membership tier, and complete checkout. Your benefits unlock immediately after payment confirmation.',
    pinned: true,
    view_count: 0,
  },
  {
    id: 2,
    question: 'Where can I buy official merch?',
    answer:
      'Our official merch is available in the store section. New drops are announced first on the homepage and social channels.',
    pinned: true,
    view_count: 0,
  },
  {
    id: 3,
    question: 'How can I submit a question to be answered?',
    answer:
      'Use the Ask page to submit your question. Our team reviews submissions and publishes approved answers on this FAQ page.',
    view_count: 0,
  },
  {
    id: 4,
    question: 'Do you offer refunds for memberships or tickets?',
    answer:
      'Refund terms vary by product. Please review checkout policies and contact support with your order details for case-by-case assistance.',
    view_count: 0,
  },
  {
    id: 5,
    question: 'How do I get updates about upcoming events?',
    answer:
      'Check the Events page regularly and follow announcements on our social channels for schedule updates and venue details.',
    view_count: 0,
  },
];

function FAQContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewCounts, setViewCounts] = useState<Record<number, number>>(() =>
    FAQ_ITEMS.reduce<Record<number, number>>((acc, item) => {
      acc[item.id] = item.view_count ?? 0;
      return acc;
    }, {})
  );

  const q = useMemo(() => query.trim().toLowerCase(), [query]);

  const filteredItems = useMemo(() => {
    const matches = q
      ? FAQ_ITEMS.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q)
        )
      : FAQ_ITEMS;

    return [...matches].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  }, [q]);

  const handleItemClick = (id: number) => {
    const newExpandedId = expandedId === id ? null : id;
    setExpandedId(newExpandedId);

    if (newExpandedId === id) {
      setViewCounts((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
    }
  };

  return (
    <>
      <h1 style={{ fontSize: 34, margin: '0 0 10px 0' }}>FAQ – Frequently Asked Questions</h1>
      <p className="sub" style={{ marginTop: 0 }}>
        Browse approved FAQ entries, search by keyword, or ask a new question.
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
            <button type="button" onClick={() => setQuery('')}>Clear</button>
          </div>

          {filteredItems.length === 0 ? (
            <p className="sub">No FAQ entries matched your search.</p>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="q"
                style={{ cursor: 'pointer' }}
                onClick={() => handleItemClick(item.id)}
              >
                <strong>
                  {item.pinned ? '📌 ' : ''}
                  {item.question}
                </strong>
                {expandedId === item.id ? (
                  <>
                    <br />
                    <span className="sub">{item.answer}</span>
                    <br />
                    <small className="sub">Views: {viewCounts[item.id] ?? 0}</small>
                  </>
                ) : null}
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
    </>
  );
}

export default function FAQPage() {
  return (
    <main className="container" style={{ padding: '40px 16px', maxWidth: 900, margin: '0 auto' }}>
      <Suspense
        fallback={
          <>
            <h1 style={{ fontSize: 34, margin: '0 0 10px 0' }}>FAQ – Frequently Asked Questions</h1>
            <p className="sub">Loading...</p>
          </>
        }
      >
        <FAQContent />
      </Suspense>
    </main>
  );
}
