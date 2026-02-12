'use client';

import PageShell from '@/components/PageShell';

export default function AboutPage() {
  return (
    <PageShell title="About the Lou Gehrig Fan Club" subtitle="A fan-run home for Gehrig’s legacy and the ALS fight">
      <h2>About This Fan Club</h2>
      <p>
        This site is a fan-run home for celebrating Lou Gehrig&apos;s legacy and supporting the ongoing fight against ALS.
      </p>

      <h2>What you&apos;ll find here</h2>
      <ul>
        <li>Weekly Photo Matchup voting (public)</li>
        <li>Milestones and historical highlights</li>
        <li>Upcoming events</li>
        <li>Members-only Fan Club area with discussions and archives</li>
      </ul>

      <h2>How you can help</h2>
      <p>
        We encourage donations to trusted ALS research and support organizations, and we highlight partners doing great work.
        Visit our Contact page if you&apos;d like to connect or suggest a collaboration.
      </p>
    </PageShell>
  );
}
