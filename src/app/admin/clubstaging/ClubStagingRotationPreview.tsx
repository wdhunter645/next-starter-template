'use client';

import { useEffect, useState } from 'react';
import ClubHomeStaticStory from '@/components/fanclub/ClubHomeStaticStory';
import type { ClubStagingRotationItem } from './clubStagingSamples';

type ClubStagingRotationPreviewProps = {
  items: ClubStagingRotationItem[];
};

export default function ClubStagingRotationPreview({ items }: ClubStagingRotationPreviewProps) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const current = items[index] ?? items[0];

  useEffect(() => {
    if (count <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [count]);

  if (!current) return null;

  const goPrev = () => setIndex((prev) => (prev - 1 + count) % count);
  const goNext = () => setIndex((prev) => (prev + 1) % count);

  return (
    <section aria-label="Club staging rotation preview">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, color: 'var(--lgfc-blue, #003366)' }}>Rotation preview</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={goPrev} aria-label="Previous rotation item">
            Previous
          </button>
          <span aria-live="polite" style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>
            {index + 1} of {count}
          </span>
          <button type="button" onClick={goNext} aria-label="Next rotation item">
            Next
          </button>
        </div>
      </div>

      <ClubHomeStaticStory
        ariaLabel={`Rotation preview item ${index + 1}`}
        title={current.title}
        headline={current.headline}
        summary={current.summary}
        credit={current.credit}
        sourceName={current.sourceName}
      />
    </section>
  );
}
