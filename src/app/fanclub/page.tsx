'use client';

import { useState } from 'react';
import FloatingLogo from '@/components/FloatingLogo';
import AdminLink from '@/components/fanclub/AdminLink';
import ArchivesTiles from '@/components/fanclub/ArchivesTiles';
import ClubHomeArchiveSpotlight from '@/components/fanclub/ClubHomeArchiveSpotlight';
import ClubHomeDeferredModule from '@/components/fanclub/ClubHomeDeferredModule';
import ClubHomeMasthead from '@/components/fanclub/ClubHomeMasthead';
import ClubHomeMediaFeature from '@/components/fanclub/ClubHomeMediaFeature';
import ClubHomeStaticStory from '@/components/fanclub/ClubHomeStaticStory';
import ClubHomeStoryRail from '@/components/fanclub/ClubHomeStoryRail';
import ClubHomeSubmissionCta from '@/components/fanclub/ClubHomeSubmissionCta';
import DiscussionFeed from '@/components/fanclub/DiscussionFeed';
import GehrigTimeline from '@/components/fanclub/GehrigTimeline';
import PostCreation from '@/components/fanclub/PostCreation';
import { clubHomePageStack } from '@/components/fanclub/clubHomeStyles';
import { useMemberSession } from '@/hooks/useMemberSession';

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
      <div style={clubHomePageStack} aria-label="FanClubHomeSections">
        <ClubHomeMasthead email={memberEmail} />

        <ClubHomeStaticStory
          ariaLabel="Lead story"
          title="Lead Story"
          headline="Lou Gehrig: The Iron Horse"
          summary="Club historians are curating the lead story for this section. Check back soon for featured Lou Gehrig coverage from the archive."
        />

        <ClubHomeStoryRail />
        <ArchivesTiles />
        <ClubHomeMediaFeature />
        <PostCreation email={memberEmail} onPostCreated={() => setFeedRefresh((n) => n + 1)} />
        <DiscussionFeed refreshTrigger={feedRefresh} />
        <ClubHomeArchiveSpotlight />
        <ClubHomeDeferredModule
          ariaLabel="Campaign module"
          title="Campaign & Fundraiser"
          reason="No active campaign module is configured. Fundraiser operations remain a separate program; this slot fails closed until explicitly scoped."
        />
        <ClubHomeDeferredModule
          ariaLabel="Events callout"
          title="Events & Calendar"
          reason="Upcoming Lou Gehrig Fan Club events will appear here when the calendar is connected."
        />
        <ClubHomeDeferredModule
          ariaLabel="Recognition tile"
          title="Recognition & Partners"
          reason="Partner and recognition highlights will appear here when new display features are enabled."
        />
        <ClubHomeSubmissionCta />
        <GehrigTimeline />
        <AdminLink isAdmin={role === 'admin'} />
      </div>
    </main>
  );
}
