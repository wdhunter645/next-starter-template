import { describe, expect, it } from 'vitest';

import {
  fundraiserTeams,
  normalizeFundraiserRecords,
  sortFundraiserLeaderboard,
  type FundraiserTeam,
} from '@/lib/fundraiser';

describe('fundraiser ingest layer', () => {
  it('loads and normalizes the fundraiser JSON seed data', () => {
    expect(fundraiserTeams).toEqual([
      {
        teamId: 'yankees',
        teamName: 'New York Yankees',
        totalAmount: 0,
        donorCount: 0,
        points: 0,
        timestamp: '2026-03-25T00:00:00Z',
      },
      {
        teamId: 'tigers',
        teamName: 'Detroit Tigers',
        totalAmount: 0,
        donorCount: 0,
        points: 0,
        timestamp: '2026-03-25T00:00:00Z',
      },
      {
        teamId: 'guardians',
        teamName: 'Cleveland Guardians',
        totalAmount: 0,
        donorCount: 0,
        points: 0,
        timestamp: '2026-03-25T00:00:00Z',
      },
    ]);
  });

  it('normalizes numeric strings before calculating points', () => {
    expect(
      normalizeFundraiserRecords([
        {
          team_id: 'team-one',
          team_name: 'Team One',
          total_amount: ' 125.5 ',
          donor_count: ' 4 ',
          timestamp: '2026-05-01T12:00:00Z',
        },
      ]),
    ).toEqual([
      {
        teamId: 'team-one',
        teamName: 'Team One',
        totalAmount: 125.5,
        donorCount: 4,
        points: 502,
        timestamp: '2026-05-01T12:00:00Z',
      },
    ]);
  });

  it('sorts normalized fundraiser records by leaderboard priority', () => {
    expect(
      normalizeFundraiserRecords([
        {
          team_id: 'lowest-points',
          team_name: 'Lowest Points',
          total_amount: 75,
          donor_count: 1,
          timestamp: '2026-05-01T12:00:00Z',
        },
        {
          team_id: 'most-donors',
          team_name: 'Most Donors',
          total_amount: 50,
          donor_count: 4,
          timestamp: '2026-05-01T12:00:00Z',
        },
        {
          team_id: 'most-points',
          team_name: 'Most Points',
          total_amount: 100,
          donor_count: 3,
          timestamp: '2026-05-01T12:00:00Z',
        },
        {
          team_id: 'fewer-donors',
          team_name: 'Fewer Donors',
          total_amount: 100,
          donor_count: 2,
          timestamp: '2026-05-01T12:00:00Z',
        },
      ]).map((team) => team.teamId),
    ).toEqual(['most-points', 'most-donors', 'fewer-donors', 'lowest-points']);
  });

  it('uses total amount and stable source order for remaining leaderboard ties', () => {
    const teams: FundraiserTeam[] = [
      {
        teamId: 'stable-first',
        teamName: 'Stable First',
        totalAmount: 10,
        donorCount: 0,
        points: 0,
        timestamp: '2026-05-01T12:00:00Z',
      },
      {
        teamId: 'most-funds',
        teamName: 'Most Funds',
        totalAmount: 100,
        donorCount: 0,
        points: 0,
        timestamp: '2026-05-01T12:00:00Z',
      },
      {
        teamId: 'stable-second',
        teamName: 'Stable Second',
        totalAmount: 10,
        donorCount: 0,
        points: 0,
        timestamp: '2026-05-01T12:00:00Z',
      },
      {
        teamId: 'fewest-funds',
        teamName: 'Fewest Funds',
        totalAmount: 5,
        donorCount: 0,
        points: 0,
        timestamp: '2026-05-01T12:00:00Z',
      },
    ];

    const sortedOnce = sortFundraiserLeaderboard(teams).map((team) => team.teamId);
    const sortedAgain = sortFundraiserLeaderboard(teams).map((team) => team.teamId);

    expect(sortedOnce).toEqual(['most-funds', 'stable-first', 'stable-second', 'fewest-funds']);
    expect(sortedAgain).toEqual(sortedOnce);
  });

  it('rejects malformed records', () => {
    expect(() =>
      normalizeFundraiserRecords([
        {
          team_id: 'bad-team',
          team_name: '',
          total_amount: 10,
          donor_count: 1,
          timestamp: '2026-05-01T12:00:00Z',
        },
      ]),
    ).toThrow(/empty team_name/i);

    expect(() =>
      normalizeFundraiserRecords([
        {
          team_id: 'bad-team',
          team_name: 'Bad Team',
          total_amount: 10,
          donor_count: 1.5,
          timestamp: '2026-05-01T12:00:00Z',
        },
      ]),
    ).toThrow(/non-integer donor_count/i);

    expect(() =>
      normalizeFundraiserRecords([
        {
          team_id: 'bad-team',
          team_name: 'Bad Team',
          total_amount: '   ',
          donor_count: 1,
          timestamp: '2026-05-01T12:00:00Z',
        },
      ]),
    ).toThrow(/invalid total_amount/i);

    expect(() =>
      normalizeFundraiserRecords([
        {
          team_id: 'bad-team',
          team_name: 'Bad Team',
          total_amount: 10,
          donor_count: '',
          timestamp: '2026-05-01T12:00:00Z',
        },
      ]),
    ).toThrow(/invalid donor_count/i);

    expect(() =>
      normalizeFundraiserRecords([
        {
          team_id: 'bad-team',
          team_name: 'Bad Team',
          total_amount: 10,
          donor_count: '   ',
          timestamp: '2026-05-01T12:00:00Z',
        },
      ]),
    ).toThrow(/invalid donor_count/i);
  });
});
