export const CAMPAIGN_SPOTLIGHT_KEY = 'home.campaign_spotlight';
export const CAMPAIGN_SPOTLIGHT_PAGE = 'home';
export const CAMPAIGN_SPOTLIGHT_SECTION = 'campaign-spotlight';
export const CAMPAIGN_SPOTLIGHT_TITLE = 'Homepage Campaign Spotlight';

export type CampaignSpotlightConfig = {
  enabled: boolean;
  eyebrow: string;
  badge: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  progressLabel: string;
  goalAmount: string;
  raisedAmount: string;
  supporterCount: string;
  deadlineLabel: string;
  note: string;
  archiveLabel: string;
};

export const defaultCampaignSpotlightConfig: CampaignSpotlightConfig = {
  enabled: false,
  eyebrow: 'Temporary Campaign Spotlight',
  badge: 'Admin Preview Only',
  title: 'ALS Fundraiser 2026',
  description:
    'Support Lou Gehrig’s legacy by helping fund ALS research and patient support. This pilot section is developed in the gated admin area first, then published to the homepage when approved.',
  primaryCtaLabel: 'Donate Now',
  primaryCtaHref: '/charities',
  secondaryCtaLabel: 'View Fundraiser Details',
  secondaryCtaHref: '/charities',
  progressLabel: 'Campaign Progress',
  goalAmount: '$25,000',
  raisedAmount: '$0',
  supporterCount: '0 supporters',
  deadlineLabel: 'Launch target: April 1',
  note: 'This section remains hidden on the homepage until enabled and published from the admin preview.',
  archiveLabel: 'To archive after the campaign, set Enabled to off and publish again. Prior published versions remain in content_revisions.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function parseCampaignSpotlightConfig(raw: string | null | undefined): CampaignSpotlightConfig | null {
  if (!raw || !raw.trim()) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const config: CampaignSpotlightConfig = {
      enabled: asBoolean(parsed.enabled, defaultCampaignSpotlightConfig.enabled),
      eyebrow: asString(parsed.eyebrow, defaultCampaignSpotlightConfig.eyebrow).trim(),
      badge: asString(parsed.badge, defaultCampaignSpotlightConfig.badge).trim(),
      title: asString(parsed.title, defaultCampaignSpotlightConfig.title).trim(),
      description: asString(parsed.description, defaultCampaignSpotlightConfig.description).trim(),
      primaryCtaLabel: asString(parsed.primaryCtaLabel, defaultCampaignSpotlightConfig.primaryCtaLabel).trim(),
      primaryCtaHref: asString(parsed.primaryCtaHref, defaultCampaignSpotlightConfig.primaryCtaHref).trim(),
      secondaryCtaLabel: asString(parsed.secondaryCtaLabel, defaultCampaignSpotlightConfig.secondaryCtaLabel).trim(),
      secondaryCtaHref: asString(parsed.secondaryCtaHref, defaultCampaignSpotlightConfig.secondaryCtaHref).trim(),
      progressLabel: asString(parsed.progressLabel, defaultCampaignSpotlightConfig.progressLabel).trim(),
      goalAmount: asString(parsed.goalAmount, defaultCampaignSpotlightConfig.goalAmount).trim(),
      raisedAmount: asString(parsed.raisedAmount, defaultCampaignSpotlightConfig.raisedAmount).trim(),
      supporterCount: asString(parsed.supporterCount, defaultCampaignSpotlightConfig.supporterCount).trim(),
      deadlineLabel: asString(parsed.deadlineLabel, defaultCampaignSpotlightConfig.deadlineLabel).trim(),
      note: asString(parsed.note, defaultCampaignSpotlightConfig.note).trim(),
      archiveLabel: asString(parsed.archiveLabel, defaultCampaignSpotlightConfig.archiveLabel).trim(),
    };

    return config;
  } catch {
    return null;
  }
}

export function validateCampaignSpotlightConfig(config: CampaignSpotlightConfig | null): string[] {
  if (!config) return ['Configuration payload is missing or invalid JSON.'];

  const errors: string[] = [];
  const requiredFields: Array<[string, string]> = [
    ['eyebrow', config.eyebrow],
    ['title', config.title],
    ['description', config.description],
    ['primaryCtaLabel', config.primaryCtaLabel],
    ['primaryCtaHref', config.primaryCtaHref],
    ['progressLabel', config.progressLabel],
    ['goalAmount', config.goalAmount],
    ['raisedAmount', config.raisedAmount],
    ['supporterCount', config.supporterCount],
    ['deadlineLabel', config.deadlineLabel],
    ['note', config.note],
  ];

  for (const [field, value] of requiredFields) {
    if (!value.trim()) errors.push(`${field} is required.`);
  }

  const hrefFields: Array<[string, string]> = [
    ['primaryCtaHref', config.primaryCtaHref],
    ['secondaryCtaHref', config.secondaryCtaHref],
  ];

  for (const [field, value] of hrefFields) {
    if (!value) continue;
    if (!(value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://'))) {
      errors.push(`${field} must start with / or http(s)://.`);
    }
  }

  return errors;
}

export function serializeCampaignSpotlightConfig(config: CampaignSpotlightConfig): string {
  return JSON.stringify(config, null, 2);
}
