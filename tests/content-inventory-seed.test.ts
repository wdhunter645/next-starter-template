import { describe, expect, it } from 'vitest';

import {
  buildPilotCleanupStatements,
  buildPilotSeedStatements,
  flattenPilotRecords,
  PILOT_CONTENT_PACK,
  PILOT_EXAMPLE_CATEGORIES,
  pilotExcludedInventoryRows,
  pilotPublicInventoryRows,
  pilotRecordsByCategory,
  pilotRejectedQueueRows,
  pilotRollbackNotes,
  validatePilotPack,
  verifyPilotExclusionRules,
  verifyPilotFixtureCoverage,
  verifyPilotInclusionRules,
  verifyPilotPublicReads,
} from '../functions/_lib/content-inventory-seed';

describe('content inventory pilot seed pack', () => {
  it('includes every required example category with source and credit data', () => {
    const validation = validatePilotPack();
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    for (const category of PILOT_EXAMPLE_CATEGORIES) {
      expect(validation.categories[category]).toBe(true);
    }

    const coverage = verifyPilotFixtureCoverage();
    expect(coverage.ok).toBe(true);
  });

  it('builds deterministic seed and cleanup SQL for pilot ids and tag prefix', () => {
    const seedStatements = buildPilotSeedStatements();
    const cleanupStatements = buildPilotCleanupStatements();

    expect(seedStatements.length).toBeGreaterThan(0);
    expect(cleanupStatements.length).toBe(4);

    expect(seedStatements.some((statement) => statement.sql.includes('9001'))).toBe(true);
    expect(seedStatements.some((statement) => statement.sql.includes('9102'))).toBe(true);
    expect(seedStatements.some((statement) => statement.sql.includes('9201'))).toBe(true);
    expect(seedStatements.some((statement) => statement.sql.includes('9301'))).toBe(true);

    for (const statement of cleanupStatements) {
      expect(statement.sql).toContain('DELETE FROM');
    }
    expect(cleanupStatements.some((statement) => statement.sql.includes('lgfc-pilot-'))).toBe(true);
  });

  it('groups canonical, alternate, media-associated, event-year, workflow, and rejected examples', () => {
    const grouped = pilotRecordsByCategory();
    expect(grouped.canonical).toHaveLength(1);
    expect(grouped.alternate).toHaveLength(1);
    expect(grouped.media_associated.length).toBeGreaterThanOrEqual(3);
    expect(grouped.event_year).toHaveLength(1);
    expect(grouped.workflow_verification.length).toBeGreaterThanOrEqual(2);
    expect(grouped.rejected_queue).toHaveLength(1);

    expect(grouped.canonical[0].tag).toBe(grouped.alternate[0].tag);
    expect(grouped.event_year[0].event_year).toBe(1939);
    expect(grouped.rejected_queue[0].status).toBe('rejected');
  });

  it('verifies public inclusion rules for published pilot inventory rows', () => {
    const inventory = flattenPilotRecords(PILOT_CONTENT_PACK.inventory);
    const inclusion = verifyPilotInclusionRules(inventory);

    expect(inclusion.ok).toBe(true);
    expect(pilotPublicInventoryRows()).toHaveLength(4);
    expect(pilotExcludedInventoryRows()).toHaveLength(1);
  });

  it('verifies rejected queue and draft inventory exclusion rules', () => {
    const inventory = flattenPilotRecords(PILOT_CONTENT_PACK.inventory);
    const queue = flattenPilotRecords(PILOT_CONTENT_PACK.queue);
    const exclusion = verifyPilotExclusionRules(inventory, queue);

    expect(exclusion.ok).toBe(true);
    expect(pilotRejectedQueueRows()).toHaveLength(1);
    expect(pilotExcludedInventoryRows()[0].status).toBe('draft');
  });

  it('demonstrates public search, library, related-content, and media inclusion behavior', async () => {
    const inventory = flattenPilotRecords(PILOT_CONTENT_PACK.inventory);
    const media = flattenPilotRecords(PILOT_CONTENT_PACK.media_associations);
    const photos = flattenPilotRecords(PILOT_CONTENT_PACK.photos);

    const publicReads = await verifyPilotPublicReads(inventory, media, photos);
    expect(publicReads.ok).toBe(true);
    expect(publicReads.checks.some((check) => check.name === 'public:search-event-year' && check.passed)).toBe(
      true,
    );
    expect(
      publicReads.checks.some((check) => check.name === 'public:search-media-associated' && check.passed),
    ).toBe(true);
    expect(
      publicReads.checks.some((check) => check.name === 'public:draft-excluded' && check.passed),
    ).toBe(true);
  });

  it('documents rollback and cleanup notes for pilot seed rows', () => {
    const notes = pilotRollbackNotes();
    expect(notes.join(' ')).toContain('buildPilotCleanupStatements');
    expect(notes.join(' ')).toContain('lgfc-pilot-');
    expect(notes.join(' ')).toContain('9102');
  });
});
