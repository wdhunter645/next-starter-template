'use client';

import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from '@/components/fanclub/clubHomeStyles';

export default function AiReviewPostCreationPreview() {
  return (
    <section aria-label="Post creation" style={clubHomeSectionCard}>
      <h2 style={clubHomeSectionTitle}>Share With the Club</h2>
      <p style={clubHomeMutedText}>
        Post creation is disabled in AI review mode. This slot shows the member work-area placement only.
      </p>
      <div
        aria-hidden="true"
        style={{
          border: '1px dashed rgba(0,0,0,0.2)',
          borderRadius: 10,
          padding: 12,
          color: '#6b7280',
        }}
      >
        Title and message inputs (read-only preview)
      </div>
    </section>
  );
}
