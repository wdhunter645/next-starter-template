'use client';

import FloatingLogo from '@/components/FloatingLogo';
import AdminLink from '@/components/fanclub/AdminLink';
import ArchivesTiles from '@/components/fanclub/ArchivesTiles';
import ClubHomeArchiveSpotlight from '@/components/fanclub/ClubHomeArchiveSpotlight';
import ClubHomeDeferredModule from '@/components/fanclub/ClubHomeDeferredModule';
import ClubHomeMasthead from '@/components/fanclub/ClubHomeMasthead';
import ClubHomeMediaFeature from '@/components/fanclub/ClubHomeMediaFeature';
import ClubHomeMemberPrompt from '@/components/fanclub/ClubHomeMemberPrompt';
import ClubHomeStaticStory from '@/components/fanclub/ClubHomeStaticStory';
import ClubHomeStoryRail from '@/components/fanclub/ClubHomeStoryRail';
import ClubHomeSubmissionCta from '@/components/fanclub/ClubHomeSubmissionCta';
import { useClubHomeContent } from '@/components/fanclub/useClubHomeContent';
import { clubHomePageStack } from '@/components/fanclub/clubHomeStyles';
import { useMemberSession } from '@/hooks/useMemberSession';

export default function MemberHomePage() {
  const { isLoading, isAuthenticated, email, role } = useMemberSession({ redirectTo: '/' });
  const clubHome = useClubHomeContent();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main>
      <FloatingLogo />
      <div style={clubHomePageStack} aria-label="FanClubHomeSections">
        <ClubHomeMasthead email={email || ''} />

        <ClubHomeStaticStory
          ariaLabel="Lead story"
          title="Lead Story"
          headline={clubHome.leadHeadline}
          summary={clubHome.leadSummary}
          credit={clubHome.leadCredit}
          sourceName={clubHome.leadSourceName}
        />

        <ClubHomeStoryRail stories={clubHome.railStories} />
        <ArchivesTiles />
        <ClubHomeMediaFeature media={clubHome.mediaFeature} />
        <ClubHomeMemberPrompt />
        <ClubHomeArchiveSpotlight story={clubHome.archiveSpotlight} />
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
        <AdminLink isAdmin={role === 'admin'} />
      </div>
    </main>
  );
}
