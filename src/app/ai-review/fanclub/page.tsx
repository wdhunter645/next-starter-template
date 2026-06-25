'use client';

import AiReviewGate from '@/components/ai-review/AiReviewGate';
import AiReviewFanclubContent from '@/components/ai-review/AiReviewFanclubContent';

export default function AiReviewFanclubPage() {
  return (
    <AiReviewGate reviewPath="/fanclub">
      {(snapshot) => <AiReviewFanclubContent snapshot={snapshot} />}
    </AiReviewGate>
  );
}
