'use client';

import AiReviewGate from '@/components/ai-review/AiReviewGate';
import AiReviewAdminContent from '@/components/ai-review/AiReviewAdminContent';

export default function AiReviewAdminPage() {
  return (
    <AiReviewGate reviewPath="/admin">
      {(snapshot) => <AiReviewAdminContent snapshot={snapshot} />}
    </AiReviewGate>
  );
}
