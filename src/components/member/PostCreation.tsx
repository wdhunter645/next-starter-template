'use client';

import { useState } from 'react';

type PostCreationProps = {
  email: string;
  onPostCreated?: () => void;
};

export default function PostCreation({ email, onPostCreated }: PostCreationProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Post text is required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/discussions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: text.substring(0, 100), // Use first 100 chars as title
          body: text,
          author_email: email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setSuccess(true);
        setText('');
        if (onPostCreated) {
          onPostCreated();
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to create post.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{
      padding: '24px 20px',
      maxWidth: 900,
      margin: '0 auto',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
    }}>
      <h2 style={{
        fontSize: 20,
        margin: '0 0 12px 0',
        fontWeight: 700,
      }}>
        Share with the Club
      </h2>

      {/* Text input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        style={{
          width: '100%',
          minHeight: 100,
          padding: 12,
          fontSize: 14,
          border: '1px solid rgba(0,0,0,0.2)',
          borderRadius: 8,
          resize: 'vertical',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
        disabled={submitting}
      />

      {/* Post visibility note */}
      <p style={{
        fontSize: 13,
        color: 'rgba(0,0,0,0.6)',
        margin: '8px 0',
      }}>
        Posts are visible to other members only.
      </p>

      {/* Error/Success messages */}
      {error && (
        <p style={{
          fontSize: 14,
          color: '#d32f2f',
          margin: '8px 0',
        }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{
          fontSize: 14,
          color: '#2e7d32',
          margin: '8px 0',
        }}>
          Post created successfully!
        </p>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !text.trim()}
        style={{
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 700,
          color: '#fff',
          background: 'var(--lgfc-blue)',
          border: 'none',
          borderRadius: 8,
          cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
          opacity: submitting || !text.trim() ? 0.6 : 1,
        }}
      >
        {submitting ? 'Posting...' : 'Post'}
      </button>

      {/* Note about attachments - future enhancement */}
      <p style={{
        fontSize: 12,
        color: 'rgba(0,0,0,0.5)',
        margin: '12px 0 0 0',
        fontStyle: 'italic',
      }}>
        Note: Photo/video attachments will be available in a future update.
      </p>
    </section>
  );
}
