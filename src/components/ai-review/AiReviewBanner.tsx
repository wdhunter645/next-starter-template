'use client';

import type { CSSProperties } from 'react';

const bannerStyle: CSSProperties = {
  background: '#1f2937',
  color: '#f9fafb',
  fontSize: 14,
  padding: '10px 16px',
  textAlign: 'center',
};

export default function AiReviewBanner({ label }: { label: string }) {
  return (
    <div role="status" aria-label="AI review mode" style={bannerStyle}>
      AI review — read-only inspection surface for {label}. Mutation controls are disabled.
    </div>
  );
}
