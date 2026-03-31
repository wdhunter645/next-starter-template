'use client';

import { useState } from 'react';
import FloatingLogo from '@/components/FloatingLogo';
import WelcomeSection from '@/components/fanclub/WelcomeSection';
import PostCreation from '@/components/fanclub/PostCreation';
import DiscussionFeed from '@/components/fanclub/DiscussionFeed';
import ArchivesTiles from '@/components/fanclub/ArchivesTiles';
import GehrigTimeline from '@/components/fanclub/GehrigTimeline';
import AdminLink from '@/components/fanclub/AdminLink';
import { useMemberSession } from '@/hooks/useMemberSession';

/**
 * FanClub Home Page - Authoritative implementation per docs/fanclub.md
 */
export default function MemberHomePage() {
  const { isLoading, isAuthenticated, email, role } = useMemberSession({ redirectTo: '/' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main>
      <FloatingLogo homeRoute="/" />
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          textAlign: 'center',
          margin: '40px 20px 32px 20px',
          color: 'var(--lgfc-blue)',
        }}
      >
        WELCOME LOU GEHRIG FAN CLUB MEMBERS
      </h1>

      <WelcomeSection email={email} />
      <ArchivesTiles />
      <PostCreation onPostCreated={handlePostCreated} />
      <DiscussionFeed refreshTrigger={refreshTrigger} />
      <GehrigTimeline />
      <AdminLink isAdmin={role === 'admin'} />
    </main>
  );
}
