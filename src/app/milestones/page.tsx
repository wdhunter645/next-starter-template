'use client';

import PageShell from '@/components/PageShell';
import MilestonesSection from '@/components/MilestonesSection';

export default function MilestonesPage() {
  return (
    <PageShell
      title="Milestones"
      subtitle="Career highlights, life events, and fan club history — backed by the live D1 database."
    >
      <MilestonesSection />
    </PageShell>
  );
}
