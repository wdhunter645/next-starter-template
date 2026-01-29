'use client';

import { useEffect, useState } from 'react';

type Discussion = {
  id: number;
  title: string;
  body: string;
  author_email?: string | null;
  created_at: string;
};

type DiscussionFeedProps = {
  refreshTrigger?: number;
};

export default function DiscussionFeed({ refreshTrigger }: DiscussionFeedProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await fetch('/api/discussions/list?limit=20');
        const data = await response.json();

        if (data.ok && data.items) {
          setDiscussions(data.items);
        } else {
          setDiscussions([]);
        }
      } catch (error) {
        console.error('Failed to fetch discussions:', error);
        setDiscussions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAuthorName = (email?: string | null) => {
    if (!email) return 'Anonymous';
    return email.split('@')[0];
  };

  return (
    <section style={{
      padding: '32px 20px',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      <h2 style={{
        fontSize: 22,
        margin: '0 0 20px 0',
        fontWeight: 700,
      }}>
        Member Discussion
      </h2>

      {loading ? (
        <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
          Loading discussions...
        </p>
      ) : discussions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {discussions.map((discussion) => (
            <div
              key={discussion.id}
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 12,
                padding: 16,
              }}
            >
              {/* Author and timestamp */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}>
                <strong style={{ fontSize: 14 }}>
                  {getAuthorName(discussion.author_email)}
                </strong>
                <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>
                  •
                </span>
                <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>
                  {formatDate(discussion.created_at)}
                </span>
              </div>

              {/* Post title (if different from body) */}
              {discussion.title && discussion.title !== discussion.body && (
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  margin: '0 0 8px 0',
                }}>
                  {discussion.title}
                </h3>
              )}

              {/* Post body */}
              <p style={{
                fontSize: 14,
                margin: 0,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>
                {discussion.body}
              </p>

              {/* Controls placeholder - like, dislike, report */}
              <div style={{
                display: 'flex',
                gap: 16,
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid rgba(0,0,0,0.05)',
              }}>
                <button
                  style={{
                    fontSize: 13,
                    color: 'rgba(0,0,0,0.6)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  disabled
                >
                  👍 Like
                </button>
                <button
                  style={{
                    fontSize: 13,
                    color: 'rgba(0,0,0,0.6)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  disabled
                >
                  👎 Dislike
                </button>
                <button
                  style={{
                    fontSize: 13,
                    color: 'rgba(0,0,0,0.6)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  disabled
                >
                  🚩 Report
                </button>
              </div>

              {/* Note: Replies/reactions will be added in future */}
              <p style={{
                fontSize: 12,
                color: 'rgba(0,0,0,0.4)',
                margin: '12px 0 0 0',
                fontStyle: 'italic',
              }}>
                Note: Replies and reactions will be available in a future update.
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
          No posts yet. Be the first to share something!
        </p>
      )}
    </section>
  );
}
