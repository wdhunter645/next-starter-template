'use client';

import { useEffect, useState } from 'react';
import { fetchClubHome, type ClubHomeApiResponse } from '@/lib/clubHomeApi';

const LEAD_FALLBACK = {
  headline: 'Lou Gehrig: The Iron Horse',
  summary:
    'Club historians are curating the lead story for this section. Check back soon for featured Lou Gehrig coverage from the archive.',
};

export function useClubHomeContent() {
  const [data, setData] = useState<ClubHomeApiResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const payload = await fetchClubHome();
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setData({ ok: false, error: 'Unable to load Club Home content.' });
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const lead = data?.ok && data.lead_story ? data.lead_story : null;

  return {
    loaded,
    lead,
    leadHeadline: lead?.headline || lead?.title || LEAD_FALLBACK.headline,
    leadSummary: lead?.summary || LEAD_FALLBACK.summary,
    leadCredit: lead?.credit ?? null,
    leadSourceName: lead?.source_name ?? null,
    railStories: data?.ok ? data.rail_stories || [] : [],
    archiveSpotlight: data?.ok ? data.archive_spotlight || null : null,
    mediaFeature: data?.ok ? data.media_feature || null : null,
    hasDynamicInventory: data?.ok && data.source === 'content_inventory',
  };
}
