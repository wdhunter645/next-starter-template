'use client';

import { useEffect, useState } from 'react';
import CampaignSpotlightCard from '@/components/home/CampaignSpotlightCard';
import {
  CAMPAIGN_SPOTLIGHT_KEY,
  parseCampaignSpotlightConfig,
  type CampaignSpotlightConfig,
  validateCampaignSpotlightConfig,
} from '@/lib/campaignSpotlight';

type CmsResponse = {
  ok?: boolean;
  block?: {
    published_body_md?: string | null;
  } | null;
};

export default function CampaignSpotlightSlot() {
  const [config, setConfig] = useState<CampaignSpotlightConfig | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/cms/get?key=${encodeURIComponent(CAMPAIGN_SPOTLIGHT_KEY)}`, {
          cache: 'no-store',
        });
        const data = (await res.json().catch(() => ({}))) as CmsResponse;
        if (!res.ok || data.ok !== true || !data.block?.published_body_md) return;

        const parsed = parseCampaignSpotlightConfig(data.block.published_body_md);
        const errors = validateCampaignSpotlightConfig(parsed);
        if (cancelled || !parsed || errors.length > 0 || !parsed.enabled) return;

        setConfig(parsed);
      } catch {
        // fail closed by rendering nothing
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!config) return null;

  return (
    <section id="campaign-spotlight" className="container section-gap" data-testid="campaign-spotlight">
      <CampaignSpotlightCard config={config} />
    </section>
  );
}
