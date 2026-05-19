import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CampaignSpotlightCard from '@/components/home/CampaignSpotlightCard';
import CampaignSpotlightSlot from '@/components/home/CampaignSpotlightSlot';
import {
  CAMPAIGN_SPOTLIGHT_KEY,
  defaultCampaignSpotlightConfig,
  parseCampaignSpotlightConfig,
  serializeCampaignSpotlightConfig,
  snapshotLeaderboardFromFundraiser,
  validateCampaignSpotlightConfig,
  type CampaignSpotlightConfig,
  type CampaignSpotlightLeaderboardEntry,
} from '@/lib/campaignSpotlight';

function sampleLeaderboard(): CampaignSpotlightLeaderboardEntry[] {
  return [
    { name: 'New York Yankees', type: 'team', funds: 1200, supporters: 4, points: 4800 },
    { name: 'Detroit Tigers', type: 'team', funds: 900, supporters: 3, points: 2700 },
    { name: 'Cleveland Guardians', type: 'team', funds: 750, supporters: 2, points: 1500 },
  ];
}

function validConfig(overrides: Partial<CampaignSpotlightConfig> = {}): CampaignSpotlightConfig {
  return {
    ...defaultCampaignSpotlightConfig,
    enabled: true,
    eyebrow: 'ALS Fundraiser 2026',
    badge: '',
    title: 'Support the Campaign',
    description: 'Help fund ALS research and patient support.',
    primaryCtaLabel: 'Donate Now',
    primaryCtaHref: 'https://givebutter.com/LouGehrigFanClub2026',
    secondaryCtaLabel: 'View Details',
    secondaryCtaHref: 'https://givebutter.com/c/LouGehrigFanClub2026/auction',
    progressLabel: 'Campaign Progress',
    goalAmount: '$25,000',
    raisedAmount: '$1,000',
    supporterCount: '12 supporters',
    deadlineLabel: 'Closes June 2, 2026',
    note: 'Published snapshot for homepage display.',
    archiveLabel: '',
    leaderboard: sampleLeaderboard(),
    ...overrides,
  };
}

function mockCmsGetResponse(payload: {
  httpOk?: boolean;
  cmsOk?: boolean;
  publishedBodyMd?: string | null;
  block?: null;
  jsonError?: boolean;
}) {
  const {
    httpOk = true,
    cmsOk = true,
    publishedBodyMd,
    block,
    jsonError = false,
  } = payload;

  return vi.fn().mockResolvedValue({
    ok: httpOk,
    json: async () => {
      if (jsonError) {
        throw new Error('invalid json');
      }

      if (block === null) {
        return { ok: cmsOk, block: null };
      }

      return {
        ok: cmsOk,
        block: {
          published_body_md: publishedBodyMd ?? null,
        },
      };
    },
  });
}

describe('campaignSpotlight config helpers', () => {
  it('returns null for empty or invalid JSON payloads', () => {
    expect(parseCampaignSpotlightConfig(null)).toBeNull();
    expect(parseCampaignSpotlightConfig(undefined)).toBeNull();
    expect(parseCampaignSpotlightConfig('   ')).toBeNull();
    expect(parseCampaignSpotlightConfig('not-json')).toBeNull();
    expect(parseCampaignSpotlightConfig('123')).toBeNull();
    expect(parseCampaignSpotlightConfig('"campaign"')).toBeNull();
  });

  it('parses a valid config and applies defaults for missing fields', () => {
    const parsed = parseCampaignSpotlightConfig(
      JSON.stringify({
        enabled: true,
        title: 'ALS Fundraiser 2026',
      }),
    );

    expect(parsed).not.toBeNull();
    expect(parsed?.enabled).toBe(true);
    expect(parsed?.title).toBe('ALS Fundraiser 2026');
    expect(parsed?.eyebrow).toBe(defaultCampaignSpotlightConfig.eyebrow);
    expect(parsed?.primaryCtaHref).toBe(defaultCampaignSpotlightConfig.primaryCtaHref);
  });

  it('reports validation errors for missing required fields', () => {
    const parsed = parseCampaignSpotlightConfig(
      JSON.stringify({
        enabled: true,
        title: '',
        description: '',
      }),
    );

    const errors = validateCampaignSpotlightConfig(parsed);
    expect(errors).toContain('title is required.');
    expect(errors).toContain('description is required.');
  });

  it('rejects href values that are not relative or absolute URLs', () => {
    const parsed = parseCampaignSpotlightConfig(
      JSON.stringify(
        validConfig({
          primaryCtaHref: 'givebutter.com/campaign',
          secondaryCtaHref: 'ftp://example.com',
        }),
      ),
    );

    const errors = validateCampaignSpotlightConfig(parsed);
    expect(errors).toContain('primaryCtaHref must start with / or http(s)://.');
    expect(errors).toContain('secondaryCtaHref must start with / or http(s)://.');
  });

  it('accepts a fully valid enabled config', () => {
    const config = validConfig();
    expect(validateCampaignSpotlightConfig(config)).toEqual([]);
    expect(validateCampaignSpotlightConfig(parseCampaignSpotlightConfig(serializeCampaignSpotlightConfig(config)))).toEqual(
      [],
    );
  });

  it('allows an empty secondary CTA href', () => {
    const config = validConfig({ secondaryCtaHref: '', secondaryCtaLabel: '' });
    expect(validateCampaignSpotlightConfig(config)).toEqual([]);
  });

  it('requires a complete leaderboard when the campaign is enabled', () => {
    const config = validConfig({ leaderboard: [] });
    expect(validateCampaignSpotlightConfig(config)).toContain(
      'leaderboard must include at least 3 entries.',
    );
  });

  it('rejects malformed leaderboard payloads during parse', () => {
    expect(
      parseCampaignSpotlightConfig(
        JSON.stringify(
          validConfig({
            leaderboard: [{ name: 'Broken', type: 'team', funds: -1, supporters: 1, points: 0 }],
          }),
        ),
      ),
    ).toBeNull();
  });

  it('snapshots the top three fundraiser teams for published snapshots', () => {
    expect(snapshotLeaderboardFromFundraiser()).toEqual([
      { name: 'New York Yankees', type: 'team', funds: 0, supporters: 0, points: 0 },
      { name: 'Detroit Tigers', type: 'team', funds: 0, supporters: 0, points: 0 },
      { name: 'Cleveland Guardians', type: 'team', funds: 0, supporters: 0, points: 0 },
    ]);
  });
});

describe('CampaignSpotlightCard leaderboard rendering', () => {
  it('renders the top three leaderboard rows for a valid snapshot', () => {
    render(<CampaignSpotlightCard config={validConfig()} />);

    expect(screen.getByTestId('campaign-spotlight-leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Top Teams')).toBeInTheDocument();
    expect(screen.getByText('New York Yankees')).toBeInTheDocument();
    expect(screen.getByText('Detroit Tigers')).toBeInTheDocument();
    expect(screen.getByText('Cleveland Guardians')).toBeInTheDocument();
    expect(screen.getByText('4,800 points')).toBeInTheDocument();
  });

  it('suppresses leaderboard rendering when the snapshot is incomplete', () => {
    render(<CampaignSpotlightCard config={validConfig({ leaderboard: sampleLeaderboard().slice(0, 2) })} />);

    expect(screen.queryByTestId('campaign-spotlight-leaderboard')).not.toBeInTheDocument();
  });

  it('suppresses leaderboard rendering when leaderboard entries are malformed', () => {
    render(
      <CampaignSpotlightCard
        config={validConfig({
          leaderboard: [
            { name: 'Broken', type: 'team', funds: Number.NaN, supporters: 1, points: 0 },
            ...sampleLeaderboard(),
          ],
        })}
      />,
    );

    expect(screen.queryByTestId('campaign-spotlight-leaderboard')).not.toBeInTheDocument();
  });
});

describe('CampaignSpotlightSlot fail-closed behavior', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requests the published CMS block for the campaign spotlight key', async () => {
    const fetchMock = mockCmsGetResponse({
      publishedBodyMd: serializeCampaignSpotlightConfig(validConfig()),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/cms/get?key=${encodeURIComponent(CAMPAIGN_SPOTLIGHT_KEY)}`,
        { cache: 'no-store' },
      );
    });
  });

  it('renders nothing when the CMS request fails', async () => {
    vi.stubGlobal('fetch', mockCmsGetResponse({ httpOk: false, publishedBodyMd: null }));

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('campaign-spotlight')).not.toBeInTheDocument();
  });

  it('renders nothing when CMS responds without a published body', async () => {
    vi.stubGlobal('fetch', mockCmsGetResponse({ publishedBodyMd: null }));

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('campaign-spotlight')).not.toBeInTheDocument();
  });

  it('renders nothing when CMS ok is false', async () => {
    vi.stubGlobal(
      'fetch',
      mockCmsGetResponse({
        cmsOk: false,
        publishedBodyMd: serializeCampaignSpotlightConfig(validConfig()),
      }),
    );

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('campaign-spotlight')).not.toBeInTheDocument();
  });

  it('renders nothing when published JSON is invalid', async () => {
    vi.stubGlobal('fetch', mockCmsGetResponse({ publishedBodyMd: '{not-json' }));

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('campaign-spotlight')).not.toBeInTheDocument();
  });

  it('renders nothing when validation fails', async () => {
    vi.stubGlobal(
      'fetch',
      mockCmsGetResponse({
        publishedBodyMd: serializeCampaignSpotlightConfig(
          validConfig({
            title: '',
          }),
        ),
      }),
    );

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('campaign-spotlight')).not.toBeInTheDocument();
  });

  it('renders nothing when leaderboard data is missing for an enabled campaign', async () => {
    vi.stubGlobal(
      'fetch',
      mockCmsGetResponse({
        publishedBodyMd: serializeCampaignSpotlightConfig(validConfig({ leaderboard: [] })),
      }),
    );

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('campaign-spotlight')).not.toBeInTheDocument();
  });

  it('renders nothing when leaderboard data is malformed in the published snapshot', async () => {
    vi.stubGlobal(
      'fetch',
      mockCmsGetResponse({
        publishedBodyMd: JSON.stringify({
          ...validConfig(),
          leaderboard: [{ name: 'Broken', type: 'team', funds: -5, supporters: 1, points: 0 }],
        }),
      }),
    );

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('campaign-spotlight')).not.toBeInTheDocument();
  });

  it('renders nothing when enabled is false', async () => {
    vi.stubGlobal(
      'fetch',
      mockCmsGetResponse({
        publishedBodyMd: serializeCampaignSpotlightConfig(validConfig({ enabled: false })),
      }),
    );

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('campaign-spotlight')).not.toBeInTheDocument();
  });

  it('renders nothing when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network failure')),
    );

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('campaign-spotlight')).not.toBeInTheDocument();
  });

  it('renders the spotlight section when published config is valid and enabled', async () => {
    const config = validConfig({ title: 'Support the Campaign' });
    vi.stubGlobal(
      'fetch',
      mockCmsGetResponse({
        publishedBodyMd: serializeCampaignSpotlightConfig(config),
      }),
    );

    render(<CampaignSpotlightSlot />);

    await waitFor(() => {
      expect(screen.getByTestId('campaign-spotlight')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Support the Campaign' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Donate Now' })).toHaveAttribute(
      'href',
      'https://givebutter.com/LouGehrigFanClub2026',
    );
    expect(screen.getByTestId('campaign-spotlight-leaderboard')).toBeInTheDocument();
    expect(screen.getByText('New York Yankees')).toBeInTheDocument();
  });
});
