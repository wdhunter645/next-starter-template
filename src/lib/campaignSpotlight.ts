import { getFundraiserTeams, type FundraiserTeam } from '@/lib/fundraiser';

export const CAMPAIGN_SPOTLIGHT_KEY = 'home.campaign_spotlight';
export const CAMPAIGN_SPOTLIGHT_PAGE = 'home';
export const CAMPAIGN_SPOTLIGHT_SECTION = 'campaign-spotlight';
export const CAMPAIGN_SPOTLIGHT_TITLE = 'Homepage Campaign Spotlight';
export const CAMPAIGN_SPOTLIGHT_LEADERBOARD_MIN_ENTRIES = 3;
export const CAMPAIGN_SPOTLIGHT_LEADERBOARD_DISPLAY_COUNT = 3;

export type CampaignSpotlightLeaderboardType = 'individual' | 'team';

export type CampaignSpotlightLeaderboardEntry = {
  name: string;
  type: CampaignSpotlightLeaderboardType;
  funds: number;
  supporters: number;
  points: number;
};

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
  leaderboard: CampaignSpotlightLeaderboardEntry[];
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
  leaderboard: [],
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

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? Number.NaN : Number(trimmed);
  }
  return Number.NaN;
}

function parseLeaderboardType(value: unknown): CampaignSpotlightLeaderboardType | null {
  if (value === 'individual' || value === 'team') return value;
  return null;
}

export function mapFundraiserTeamToLeaderboardEntry(team: FundraiserTeam): CampaignSpotlightLeaderboardEntry {
  return {
    name: team.teamName,
    type: 'team',
    funds: team.totalAmount,
    supporters: team.donorCount,
    points: team.points,
  };
}

export function snapshotLeaderboardFromFundraiser(
  teams: FundraiserTeam[] = getFundraiserTeams(),
): CampaignSpotlightLeaderboardEntry[] {
  return teams
    .slice(0, CAMPAIGN_SPOTLIGHT_LEADERBOARD_DISPLAY_COUNT)
    .map(mapFundraiserTeamToLeaderboardEntry);
}

export function parseCampaignSpotlightLeaderboard(raw: unknown): CampaignSpotlightLeaderboardEntry[] | null {
  if (!Array.isArray(raw)) return null;

  const entries: CampaignSpotlightLeaderboardEntry[] = [];

  for (const item of raw) {
    if (!isRecord(item)) return null;

    const name = asString(item.name).trim();
    const type = parseLeaderboardType(item.type);
    const funds = asNumber(item.funds);
    const supporters = asNumber(item.supporters);
    const points = asNumber(item.points);

    if (!name || !type) return null;
    if (!Number.isFinite(funds) || funds < 0) return null;
    if (!Number.isFinite(supporters) || supporters < 0 || !Number.isInteger(supporters)) return null;
    if (!Number.isFinite(points) || points < 0) return null;

    entries.push({ name, type, funds, supporters, points });
  }

  return entries;
}

export function validateCampaignSpotlightLeaderboard(
  leaderboard: CampaignSpotlightLeaderboardEntry[] | null | undefined,
): string[] {
  if (!leaderboard) return ['leaderboard is required.'];
  if (leaderboard.length < CAMPAIGN_SPOTLIGHT_LEADERBOARD_MIN_ENTRIES) {
    return [
      `leaderboard must include at least ${CAMPAIGN_SPOTLIGHT_LEADERBOARD_MIN_ENTRIES} entries.`,
    ];
  }

  const errors: string[] = [];

  for (let index = 0; index < CAMPAIGN_SPOTLIGHT_LEADERBOARD_MIN_ENTRIES; index += 1) {
    const entry = leaderboard[index];
    const prefix = `leaderboard[${index}]`;

    if (!entry.name.trim()) errors.push(`${prefix}.name is required.`);
    if (entry.type !== 'individual' && entry.type !== 'team') {
      errors.push(`${prefix}.type must be individual or team.`);
    }
    if (!Number.isFinite(entry.funds) || entry.funds < 0) {
      errors.push(`${prefix}.funds must be a non-negative number.`);
    }
    if (!Number.isFinite(entry.supporters) || entry.supporters < 0 || !Number.isInteger(entry.supporters)) {
      errors.push(`${prefix}.supporters must be a non-negative integer.`);
    }
    if (!Number.isFinite(entry.points) || entry.points < 0) {
      errors.push(`${prefix}.points must be a non-negative number.`);
    }
  }

  return errors;
}

export function getCampaignSpotlightLeaderboardForDisplay(
  config: CampaignSpotlightConfig,
): CampaignSpotlightLeaderboardEntry[] {
  return config.leaderboard.slice(0, CAMPAIGN_SPOTLIGHT_LEADERBOARD_DISPLAY_COUNT);
}

export function buildPersistedCampaignConfig(config: CampaignSpotlightConfig): CampaignSpotlightConfig {
  if (!config.enabled) return config;

  if (validateCampaignSpotlightLeaderboard(config.leaderboard).length === 0) {
    return config;
  }

  return {
    ...config,
    leaderboard: snapshotLeaderboardFromFundraiser(),
  };
}

export function formatCampaignSpotlightFunds(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function parseCampaignSpotlightConfig(raw: string | null | undefined): CampaignSpotlightConfig | null {
  if (!raw || !raw.trim()) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const parsedLeaderboard = parseCampaignSpotlightLeaderboard(parsed.leaderboard);
    if (parsed.leaderboard !== undefined && parsedLeaderboard === null) return null;

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
      leaderboard: parsedLeaderboard ?? defaultCampaignSpotlightConfig.leaderboard,
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

  if (config.enabled) {
    errors.push(...validateCampaignSpotlightLeaderboard(config.leaderboard));
  }

  return errors;
}

export function serializeCampaignSpotlightConfig(config: CampaignSpotlightConfig): string {
  return JSON.stringify(config, null, 2);
}
