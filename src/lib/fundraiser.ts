import fundraiserSource from '../../data/fundraiser.json';

export type FundraiserSourceRecord = {
  team_id: string;
  team_name: string;
  total_amount: number | string;
  donor_count: number | string;
  timestamp: string;
};

export type FundraiserTeam = {
  teamId: string;
  teamName: string;
  totalAmount: number;
  donorCount: number;
  points: number;
  timestamp: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeRequiredString(value: unknown, field: string, index: number): string {
  if (typeof value !== 'string') {
    throw new Error(`Fundraiser record ${index} has invalid ${field}.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Fundraiser record ${index} has empty ${field}.`);
  }

  return normalized;
}

function normalizeAmount(value: unknown, field: string, index: number): number {
  let normalized = Number.NaN;

  if (typeof value === 'number') {
    normalized = value;
  } else if (typeof value === 'string') {
    const trimmedValue = value.trim();
    normalized = trimmedValue === '' ? Number.NaN : Number(trimmedValue);
  }

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new Error(`Fundraiser record ${index} has invalid ${field}.`);
  }

  return normalized;
}

function normalizeDonorCount(value: unknown, field: string, index: number): number {
  const normalized = normalizeAmount(value, field, index);

  if (!Number.isInteger(normalized)) {
    throw new Error(`Fundraiser record ${index} has non-integer ${field}.`);
  }

  return normalized;
}

function normalizeTimestamp(value: unknown, index: number): string {
  const timestamp = normalizeRequiredString(value, 'timestamp', index);

  if (Number.isNaN(Date.parse(timestamp))) {
    throw new Error(`Fundraiser record ${index} has invalid timestamp.`);
  }

  return timestamp;
}

function compareFundraiserLeaderboardEntries(left: FundraiserTeam, right: FundraiserTeam): number {
  return (
    right.points - left.points ||
    right.donorCount - left.donorCount ||
    right.totalAmount - left.totalAmount
  );
}

export function sortFundraiserLeaderboard(teams: FundraiserTeam[]): FundraiserTeam[] {
  return [...teams].sort((left, right) => compareFundraiserLeaderboardEntries(left, right));
}

export function normalizeFundraiserRecords(records: unknown): FundraiserTeam[] {
  if (!Array.isArray(records)) {
    throw new Error('Fundraiser source must be an array.');
  }

  const teams = records.map((record, index) => {
    if (!isRecord(record)) {
      throw new Error(`Fundraiser record ${index} must be an object.`);
    }

    const teamId = normalizeRequiredString(record.team_id, 'team_id', index);
    const teamName = normalizeRequiredString(record.team_name, 'team_name', index);
    const totalAmount = normalizeAmount(record.total_amount, 'total_amount', index);
    const donorCount = normalizeDonorCount(record.donor_count, 'donor_count', index);
    const timestamp = normalizeTimestamp(record.timestamp, index);

    return {
      teamId,
      teamName,
      totalAmount,
      donorCount,
      points: totalAmount * donorCount,
      timestamp,
    };
  });

  return sortFundraiserLeaderboard(teams);
}

export function getFundraiserTeams(): FundraiserTeam[] {
  return normalizeFundraiserRecords(fundraiserSource);
}

export const fundraiserTeams = getFundraiserTeams();
