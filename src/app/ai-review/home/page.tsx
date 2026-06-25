'use client';

import AiReviewGate from '@/components/ai-review/AiReviewGate';
import AiReviewHomeContent from '@/components/ai-review/AiReviewHomeContent';

export default function AiReviewHomePage() {
  return (
    <AiReviewGate reviewPath="/">
      {() => <AiReviewHomeContent />}
    </AiReviewGate>
  );
}
