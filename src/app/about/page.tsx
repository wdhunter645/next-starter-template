'use client';

import PageShell from '@/components/PageShell';

export default function AboutPage() {
  return (
    <PageShell title="About the Lou Gehrig Fan Club" subtitle="A fan-run community honoring Gehrig's legacy and the ALS fight ahead of our 2027 public relaunch">
      <h2>About This Fan Club</h2>
      <p>
        The Lou Gehrig Fan Club is a fan-run community for celebrating Lou Gehrig&apos;s legacy, preserving club history, and supporting ALS awareness.
        The public site is open to everyone; the member Fan Club area is available after Join or Login.
      </p>

      <h2>What you&apos;ll find here</h2>
      <ul>
        <li>Public Lou Gehrig history, milestones, and weekly photo voting</li>
        <li>Approved public FAQs and a question intake path for moderator review</li>
        <li>Upcoming events and calendar previews as launch content is finalized</li>
        <li>Members-only Fan Club archives, discussions, and club activity after login</li>
      </ul>

      <h2>How you can help</h2>
      <p>
        We encourage support for trusted ALS research and advocacy organizations. The Lou Gehrig Fan Club website does not currently run a live
        fundraiser campaign on this site. Visit our Contact page to share corrections, contributions, partnerships, or Lou Gehrig Day coordination ideas.
      </p>
    </PageShell>
  );
}
