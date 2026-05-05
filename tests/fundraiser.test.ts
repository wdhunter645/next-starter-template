import { describe, expect, it } from 'vitest';

import { fundraiserTeams, normalizeFundraiserRecords } from '@/lib/fundraiser';

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
  });
});
