import { getFundraiserTeams, type FundraiserTeam } from '@/lib/fundraiser';

export const CAMPAIGN_SPOTLIGHT_KEY = 'home.campaign_spotlight';
export const CAMPAIGN_SPOTLIGHT_PAGE = 'home';
export const CAMPAIGN_SPOTLIGHT_SECTION = 'campaign-spotlight';
export const CAMPAIGN_SPOTLIGHT_TITLE = 'Homepage Campaign Spotlight';
export const CAMPAIGN_SPOTLIGHT_LEADERBOARD_MIN_ENTRIES = 3;
export const CAMPAIGN_SPOTLIGHT_LEADERBOARD_DISPLAY_COUNT = 3;

export const CAMPAIGN_SPOTLIGHT_GIVEBUTTER_CAMPAIGN_URL =
  'https://givebutter.com/LouGehrigFanClub2026';
export const CAMPAIGN_SPOTLIGHT_GIVEBUTTER_AUCTION_URL =
  'https://givebutter.com/c/LouGehrigFanClub2026/auction';

const CAMPAIGN_SPOTLIGHT_PLACEHOLDER_CTA_HREFS = new Set(['/charities', '/charities/']);

export type CampaignSpotlightLeaderboardType = 'individual' | 'team';

/** Task 001 canonical launch states for website campaign display. */
export type CampaignLaunchStatus =
  | 'draft'
  | 'preview'
  | 'active'
  | 'paused'
  | 'ended'
  | 'archived';

/** Task 005 recognition consent states for public leaderboard/recognition rows. */
export type CampaignRecognitionConsent =
  | 'unknown'
  | 'anonymous-only'
  | 'display-name-approved'
  | 'sponsor-public-approved'
  | 'withdrawn'
  | 'rejected';

export const CAMPAIGN_LAUNCH_STATUSES: readonly CampaignLaunchStatus[] = [
  'draft',
  'preview',
  'active',
  'paused',
  'ended',
  'archived',
] as const;

const CAMPAIGN_LAUNCH_STATUS_SET = new Set<string>(CAMPAIGN_LAUNCH_STATUSES);

const PUBLIC_VISIBLE_LAUNCH_STATUSES = new Set<CampaignLaunchStatus>(['active', 'paused', 'ended']);

const PUBLIC_BLOCKED_CONSENTS = new Set<CampaignRecognitionConsent>([
  'unknown',
  'withdrawn',
  'rejected',
]);

export type CampaignSpotlightLeaderboardEntry = {
  name: string;
  type: CampaignSpotlightLeaderboardType;
  funds: number;
  supporters: number;
  points: number;
  /** Optional Task 005 consent; omitted means legacy snapshot (allowed when privacy-safe). */
  consent?: CampaignRecognitionConsent;
  is_anonymous?: boolean;
  /** Optional approved public label override (Task 005 display_label). */
  display_label?: string;
};

export type CampaignSpotlightConfig = {
  enabled: boolean;
  /**
   * Canonical launch status. Omitted/`undefined` preserves legacy configs:
   * enabled + missing status behaves as live/active for backward compatibility.
   */
  status?: CampaignLaunchStatus;
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
  status: 'draft',
  eyebrow: 'Temporary Campaign Spotlight',
  badge: 'Admin Preview Only',
  title: 'ALS Fundraiser 2026',
  description:
    'Support Lou Gehrig’s legacy by helping fund ALS research and patient support. This pilot section is developed in the gated admin area first, then published to the homepage when approved.',
  primaryCtaLabel: 'Donate Now',
  primaryCtaHref: CAMPAIGN_SPOTLIGHT_GIVEBUTTER_CAMPAIGN_URL,
  secondaryCtaLabel: 'View Auction',
  secondaryCtaHref: CAMPAIGN_SPOTLIGHT_GIVEBUTTER_AUCTION_URL,
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

function parseCampaignLaunchStatus(value: unknown): CampaignLaunchStatus | undefined | null {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') return null;
  if (!CAMPAIGN_LAUNCH_STATUS_SET.has(value)) return null;
  return value as CampaignLaunchStatus;
}

function parseRecognitionConsent(value: unknown): CampaignRecognitionConsent | undefined | null {
  if (value === undefined || value === null || value === '') return undefined;
  if (
    value === 'unknown' ||
    value === 'anonymous-only' ||
    value === 'display-name-approved' ||
    value === 'sponsor-public-approved' ||
    value === 'withdrawn' ||
    value === 'rejected'
  ) {
    return value;
  }
  return null;
}

export function mapFundraiserTeamToLeaderboardEntry(team: FundraiserTeam): CampaignSpotlightLeaderboardEntry {
  return {
    name: team.teamName,
    type: 'team',
    funds: team.totalAmount,
    supporters: team.donorCount,
    points: team.points,
    consent: 'display-name-approved',
    display_label: team.teamName,
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
    const consent = parseRecognitionConsent(item.consent);
    if (consent === null) return null;

    const displayLabelRaw = asString(item.display_label).trim();
    const isAnonymous = item.is_anonymous === undefined ? undefined : asBoolean(item.is_anonymous, false);

    if (!name || !type) return null;
    if (!Number.isFinite(funds) || funds < 0) return null;
    if (!Number.isFinite(supporters) || supporters < 0 || !Number.isInteger(supporters)) return null;
    if (!Number.isFinite(points) || points < 0) return null;

    const entry: CampaignSpotlightLeaderboardEntry = { name, type, funds, supporters, points };
    if (consent !== undefined) entry.consent = consent;
    if (isAnonymous !== undefined) entry.is_anonymous = isAnonymous;
    if (displayLabelRaw) entry.display_label = displayLabelRaw;

    entries.push(entry);
  }

  return entries;
}

/** Effective launch status for display gates (legacy enabled configs without status act as active). */
export function getEffectiveCampaignLaunchStatus(config: CampaignSpotlightConfig): CampaignLaunchStatus {
  if (config.status) return config.status;
  return config.enabled ? 'active' : 'draft';
}

/** Public homepage may render only for enabled + active|paused|ended. */
export function isCampaignSpotlightPubliclyVisible(config: CampaignSpotlightConfig): boolean {
  if (!config.enabled) return false;
  return PUBLIC_VISIBLE_LAUNCH_STATUSES.has(getEffectiveCampaignLaunchStatus(config));
}

/** Live donate/auction CTAs only while campaign is active. */
export function campaignAllowsLiveDonationCtas(config: CampaignSpotlightConfig): boolean {
  return config.enabled && getEffectiveCampaignLaunchStatus(config) === 'active';
}

export function getCampaignSpotlightStatusBadge(config: CampaignSpotlightConfig): string | null {
  const status = getEffectiveCampaignLaunchStatus(config);
  if (status === 'paused') return 'Campaign paused';
  if (status === 'ended') return 'Campaign ended';
  return null;
}

function resolveRecognitionConsent(entry: CampaignSpotlightLeaderboardEntry): CampaignRecognitionConsent {
  if (entry.consent) return entry.consent;
  // Legacy team snapshots without consent: team names are public labels, not donor PII.
  if (entry.type === 'team') return 'display-name-approved';
  return 'unknown';
}

/**
 * Privacy-safe public recognition label (Task 005). Returns null when the row must be hidden.
 */
export function getCampaignSpotlightRecognitionLabel(entry: CampaignSpotlightLeaderboardEntry): string | null {
  if (entry.is_anonymous) return 'Anonymous';

  const consent = resolveRecognitionConsent(entry);
  if (PUBLIC_BLOCKED_CONSENTS.has(consent)) return null;
  if (consent === 'anonymous-only') return 'Anonymous';

  const label = (entry.display_label || entry.name).trim();
  return label || null;
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
  options: { publicRecognitionOnly?: boolean } = {},
): Array<CampaignSpotlightLeaderboardEntry & { publicLabel: string }> {
  const publicRecognitionOnly = options.publicRecognitionOnly ?? true;
  const rows: Array<CampaignSpotlightLeaderboardEntry & { publicLabel: string }> = [];

  for (const entry of config.leaderboard) {
    if (rows.length >= CAMPAIGN_SPOTLIGHT_LEADERBOARD_DISPLAY_COUNT) break;
    const publicLabel = getCampaignSpotlightRecognitionLabel(entry);
    if (!publicLabel) {
      if (publicRecognitionOnly) continue;
      rows.push({ ...entry, publicLabel: entry.name });
      continue;
    }
    rows.push({ ...entry, publicLabel });
  }

  return rows;
}

export type CampaignSpotlightCta = {
  label: string;
  href: string;
};

export function isCampaignSpotlightPlaceholderCtaHref(href: string): boolean {
  return CAMPAIGN_SPOTLIGHT_PLACEHOLDER_CTA_HREFS.has(href.trim().toLowerCase());
}

export function isCampaignSpotlightExternalCtaHref(href: string): boolean {
  const lower = href.trim().toLowerCase();
  return lower.startsWith('https://') || lower.startsWith('http://') || lower.startsWith('//');
}

export function validateCampaignSpotlightCtaHref(
  field: string,
  href: string,
  options: { required?: boolean } = {},
): string[] {
  const trimmed = href.trim();
  const errors: string[] = [];

  if (options.required && !trimmed) {
    errors.push(`${field} is required.`);
    return errors;
  }

  if (!trimmed) return errors;

  if (!(trimmed.startsWith('/') || isCampaignSpotlightExternalCtaHref(trimmed))) {
    errors.push(`${field} must start with / or http(s)://.`);
  }

  return errors;
}

export function getCampaignSpotlightLinkProps(
  href: string,
  label?: string,
): { target?: '_blank'; rel?: string; 'aria-label'?: string } {
  if (!isCampaignSpotlightExternalCtaHref(href)) return {};

  const props: { target: '_blank'; rel: string; 'aria-label'?: string } = {
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  if (label?.trim()) {
    props['aria-label'] = `${label.trim()} (opens in new tab)`;
  }

  return props;
}

export function getCampaignSpotlightPrimaryCtaForDisplay(
  config: CampaignSpotlightConfig,
): CampaignSpotlightCta | null {
  if (!campaignAllowsLiveDonationCtas(config)) return null;

  const label = config.primaryCtaLabel.trim();
  const href = config.primaryCtaHref.trim();

  if (!label || !href) return null;
  if (isCampaignSpotlightPlaceholderCtaHref(href)) return null;
  if (validateCampaignSpotlightCtaHref('primaryCtaHref', href, { required: true }).length > 0) {
    return null;
  }

  return { label, href };
}

export function getCampaignSpotlightSecondaryCtaForDisplay(
  config: CampaignSpotlightConfig,
): CampaignSpotlightCta | null {
  if (!campaignAllowsLiveDonationCtas(config)) return null;

  const label = config.secondaryCtaLabel.trim();
  const href = config.secondaryCtaHref.trim();

  if (!label || !href) return null;
  if (isCampaignSpotlightPlaceholderCtaHref(href)) return null;
  if (validateCampaignSpotlightCtaHref('secondaryCtaHref', href).length > 0) return null;

  return { label, href };
}

export function normalizeCampaignSpotlightCtaHrefs(
  config: CampaignSpotlightConfig,
): CampaignSpotlightConfig {
  if (!config.enabled) return config;

  const primaryCtaHref =
    isCampaignSpotlightPlaceholderCtaHref(config.primaryCtaHref) || !config.primaryCtaHref.trim()
      ? CAMPAIGN_SPOTLIGHT_GIVEBUTTER_CAMPAIGN_URL
      : config.primaryCtaHref.trim();

  const secondaryCtaHref = isCampaignSpotlightPlaceholderCtaHref(config.secondaryCtaHref)
    ? CAMPAIGN_SPOTLIGHT_GIVEBUTTER_AUCTION_URL
    : config.secondaryCtaHref.trim();

  if (primaryCtaHref === config.primaryCtaHref && secondaryCtaHref === config.secondaryCtaHref) {
    return config;
  }

  return {
    ...config,
    primaryCtaHref,
    secondaryCtaHref,
  };
}

export function buildPersistedCampaignConfig(config: CampaignSpotlightConfig): CampaignSpotlightConfig {
  if (!config.enabled) return config;

  const withCtas = normalizeCampaignSpotlightCtaHrefs(config);

  if (validateCampaignSpotlightLeaderboard(withCtas.leaderboard).length === 0) {
    return withCtas;
  }

  return {
    ...withCtas,
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

    const status = parseCampaignLaunchStatus(parsed.status);
    if (status === null) return null;

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

    if (status !== undefined) config.status = status;

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

  errors.push(...validateCampaignSpotlightCtaHref('primaryCtaHref', config.primaryCtaHref, { required: true }));
  errors.push(...validateCampaignSpotlightCtaHref('secondaryCtaHref', config.secondaryCtaHref));

  if (config.status !== undefined && !CAMPAIGN_LAUNCH_STATUS_SET.has(config.status)) {
    errors.push('status must be a canonical launch state.');
  }

  if (config.enabled) {
    if (isCampaignSpotlightPlaceholderCtaHref(config.primaryCtaHref)) {
      errors.push('primaryCtaHref must not use the placeholder /charities route when enabled.');
    }
    if (
      config.secondaryCtaLabel.trim() &&
      config.secondaryCtaHref.trim() &&
      isCampaignSpotlightPlaceholderCtaHref(config.secondaryCtaHref)
    ) {
      errors.push('secondaryCtaHref must not use the placeholder /charities route when enabled.');
    }
    errors.push(...validateCampaignSpotlightLeaderboard(config.leaderboard));
  }

  return errors;
}

export function serializeCampaignSpotlightConfig(config: CampaignSpotlightConfig): string {
  return JSON.stringify(config, null, 2);
}
