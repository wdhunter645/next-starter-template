'use client';

import React from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';
import ClubHomeMasthead from '@/components/fanclub/ClubHomeMasthead';
import ClubHomeStoryRail from '@/components/fanclub/ClubHomeStoryRail';
import { clubHomePageStack } from '@/components/fanclub/clubHomeStyles';
import ClubStagingDiscussionSamples from './ClubStagingDiscussionSamples';
import ClubStagingRotationPreview from './ClubStagingRotationPreview';
import {
  CLUB_STAGING_BOUNDARY_COPY,
  CLUB_STAGING_DISCUSSION_SAMPLES,
  CLUB_STAGING_RAIL_STORIES,
  CLUB_STAGING_ROTATION_ITEMS,
} from './clubStagingSamples';

const stagingBannerStyle: React.CSSProperties = {
  margin: '0 0 20px 0',
  padding: '14px 16px',
  borderRadius: 12,
  border: '1px solid rgba(180, 83, 9, 0.35)',
  background: 'rgba(255, 247, 237, 0.95)',
  color: '#7c2d12',
  fontWeight: 600,
  lineHeight: 1.5,
};

const previewFrameStyle: React.CSSProperties = {
  ...clubHomePageStack,
  padding: 20,
  border: '2px dashed rgba(0, 51, 102, 0.25)',
  borderRadius: 14,
  background: 'rgba(0, 51, 102, 0.03)',
};

export default function AdminClubStagingPage() {
  return (
    <PageShell
      title="Admin – Club Staging"
      subtitle="Visual preview for staged club content and rotation review. Not published to public routes."
    >
      <AdminNav />

      <p role="status" style={stagingBannerStyle}>
        {CLUB_STAGING_BOUNDARY_COPY}
      </p>

      <div style={previewFrameStyle} role="region" aria-label="Club staging production-like preview">
        <ClubHomeMasthead email="staging.preview@lougehrigfanclub.com" />
        <ClubStagingRotationPreview items={CLUB_STAGING_ROTATION_ITEMS} />
        <ClubHomeStoryRail stories={CLUB_STAGING_RAIL_STORIES} />
        <ClubStagingDiscussionSamples items={CLUB_STAGING_DISCUSSION_SAMPLES} />
      </div>

      <p style={{ marginTop: 20, color: 'rgba(0,0,0,0.65)', lineHeight: 1.55, fontSize: 14 }}>
        `/admin/homestaging` remains reserved for a possible future homepage staging surface and is intentionally not
        implemented in Task #2043. Program #2040 owns publication workflow; this page is preview-only.
      </p>
    </PageShell>
  );
}
