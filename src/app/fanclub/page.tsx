'use client';

import { useState } from 'react';
import FloatingLogo from '@/components/FloatingLogo';
import AdminLink from '@/components/fanclub/AdminLink';
import ArchivesTiles from '@/components/fanclub/ArchivesTiles';
import DiscussionFeed from '@/components/fanclub/DiscussionFeed';
import GehrigTimeline from '@/components/fanclub/GehrigTimeline';
import PostCreation from '@/components/fanclub/PostCreation';
import WelcomeSection from '@/components/fanclub/WelcomeSection';
import { useMemberSession } from '@/hooks/useMemberSession';

const sectionStackStyle = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '0 20px 40px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 20,
};

export default function MemberHomePage() {
  const { isLoading, isAuthenticated, email, role } = useMemberSession({ redirectTo: '/' });
  const [feedRefresh, setFeedRefresh] = useState(0);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const memberEmail = email || '';

  return (
    <main>
      <FloatingLogo />
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          textAlign: 'center',
          margin: '40px 20px 24px',
          color: 'var(--lgfc-blue)',
        }}
      >
        WELCOME LOU GEHRIG FAN CLUB MEMBERS
      </h1>

      <div style={sectionStackStyle} aria-label="FanClubHomeSections">
        <WelcomeSection email={memberEmail} />
        <ArchivesTiles />
        <PostCreation email={memberEmail} onPostCreated={() => setFeedRefresh((n) => n + 1)} />
        <DiscussionFeed refreshTrigger={feedRefresh} />
        <GehrigTimeline />
        <AdminLink isAdmin={role === 'admin'} />
      </div>
    </main>
  );
}
