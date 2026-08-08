import { describe, expect, it } from 'vitest';

import { buildPlanForBackfill, MIGRATION_TAG_PREFIX, sqlLiteral } from '../scripts/migrations/library-content-backfill.mjs';

// #2911's tooling is read-only evidence for this task (no modification), per #2912's
// non-goals. The revert/recovery operation itself is new test-only logic — it is not
// added as production tooling here (out of this task's writable allowlist), only proven
// and documented as an exact operator sequence in the paired evidence report.

type InventoryRow = {
  id: number;
  tag: string;
  title: string;
  source_name: string;
  status: string;
  canonical: number;
};

/** The exact statement an operator would run to revert a migration by tag prefix. */
export function buildRevertByTagPrefixStatement(prefix: string): string {
  return `DELETE FROM content_inventory WHERE canonical = 1 AND tag LIKE ${sqlLiteral(`${prefix}%`)};`;
}

/** In-memory simulation of the revert statement above, for isolated (no-DB) proof. */
function simulateRevertByTagPrefix(rows: InventoryRow[], prefix: string): InventoryRow[] {
  return rows.filter((row) => !(row.canonical === 1 && row.tag.startsWith(prefix)));
}

function migratedRow(id: number, overrides: Partial<InventoryRow> = {}): InventoryRow {
  return {
    id,
    tag: `${MIGRATION_TAG_PREFIX}${id}`,
    title: `Migrated ${id}`,
    source_name: 'LGFC Fan Club Library (legacy submission)',
    status: 'draft',
    canonical: 1,
    ...overrides,
  };
}

describe('recovery: revert-by-tag-prefix statement (#2912)', () => {
  it('generates a statement scoped to canonical rows under exactly the migration tag prefix', () => {
    const sql = buildRevertByTagPrefixStatement(MIGRATION_TAG_PREFIX);
    expect(sql).toBe("DELETE FROM content_inventory WHERE canonical = 1 AND tag LIKE 'legacy-library-%';");
  });

  it('removes only legacy-migrated rows, leaving non-legacy canonical inventory untouched', () => {
    const rows: InventoryRow[] = [
      migratedRow(1),
      migratedRow(2),
      { id: 3, tag: 'club-newspaper-feature-9', title: 'Editorial feature', source_name: 'LGFC Editorial', status: 'published', canonical: 1 },
    ];
    const result = simulateRevertByTagPrefix(rows, MIGRATION_TAG_PREFIX);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it('leaves non-canonical rows (canonical = 0, e.g. rejected duplicates) untouched even if tagged', () => {
    const rows: InventoryRow[] = [migratedRow(1), migratedRow(2, { canonical: 0 })];
    const result = simulateRevertByTagPrefix(rows, MIGRATION_TAG_PREFIX);
    expect(result).toHaveLength(1);
    expect(result[0].canonical).toBe(0);
  });

  it('is a no-op (idempotent) when run a second time against already-reverted state', () => {
    const rows: InventoryRow[] = [migratedRow(1), migratedRow(2)];
    const once = simulateRevertByTagPrefix(rows, MIGRATION_TAG_PREFIX);
    const twice = simulateRevertByTagPrefix(once, MIGRATION_TAG_PREFIX);
    expect(once).toEqual(twice);
    expect(twice).toHaveLength(0);
  });

  it('leaves no orphaned state: reverting all migrated rows results in an empty legacy-tagged set', () => {
    const rows: InventoryRow[] = [migratedRow(1), migratedRow(2), migratedRow(3)];
    const result = simulateRevertByTagPrefix(rows, MIGRATION_TAG_PREFIX);
    expect(result.filter((r) => r.tag.startsWith(MIGRATION_TAG_PREFIX))).toHaveLength(0);
  });
});

describe('recovery: full backfill -> revert -> re-backfill cycle (isolated restore proof)', () => {
  it('proves a reverted migration can be safely re-applied from scratch (matches a fresh first run)', () => {
    const legacyRows = [
      { id: 1, name: 'Jane Fan', email: 'jane@example.com', title: 'Story One', content: 'Body one.', created_at: '2020-01-01T00:00:00Z' },
      { id: 2, name: '', email: 'anon@example.com', title: 'Story Two', content: 'Body two.', created_at: '2021-01-01T00:00:00Z' },
    ];

    // 1. Fresh backfill plan (nothing migrated yet).
    const freshPlan = buildPlanForBackfill(legacyRows, false, []);
    expect(freshPlan.summary).toEqual({ insert: 2, update: 0, noop: 0, excluded: 0, conflict: 0 });

    // 2. Simulate applying it.
    const afterFirstBackfill = (freshPlan.plans as Array<{ action: string; fields?: Record<string, unknown> }>)
      .filter((p) => p.action === 'insert')
      .map((p, i) => ({ id: 500 + i, ...p.fields })) as unknown as InventoryRow[];
    expect(afterFirstBackfill).toHaveLength(2);

    // 3. Revert by tag prefix (isolated recovery action).
    const afterRevert = simulateRevertByTagPrefix(afterFirstBackfill, MIGRATION_TAG_PREFIX);
    expect(afterRevert).toHaveLength(0);

    // 4. Re-run the backfill plan against the now-empty (reverted) inventory state.
    const rePlan = buildPlanForBackfill(legacyRows, false, afterRevert);

    // The re-applied plan must be identical in shape to the original fresh plan —
    // proving the revert left no residue that would change migration behavior.
    expect(rePlan.summary).toEqual(freshPlan.summary);
  });

  it('proves a partial revert (single tag) does not disturb the rest of the migrated set', () => {
    const legacyRows = [
      { id: 1, name: 'A', email: 'a@example.com', title: 'One', content: 'Body one.', created_at: '2020-01-01T00:00:00Z' },
      { id: 2, name: 'B', email: 'b@example.com', title: 'Two', content: 'Body two.', created_at: '2020-01-01T00:00:00Z' },
      { id: 3, name: 'C', email: 'c@example.com', title: 'Three', content: 'Body three.', created_at: '2020-01-01T00:00:00Z' },
    ];
    const plan = buildPlanForBackfill(legacyRows, false, []);
    const migrated = (plan.plans as Array<{ action: string; fields?: Record<string, unknown> }>)
      .filter((p) => p.action === 'insert')
      .map((p, i) => ({ id: 700 + i, ...p.fields })) as unknown as InventoryRow[];

    // Revert only the single row for legacy id 2.
    const remaining = migrated.filter((row) => !(row.canonical === 1 && row.tag === `${MIGRATION_TAG_PREFIX}2`));

    expect(remaining).toHaveLength(2);
    expect(remaining.map((r) => r.tag).sort()).toEqual([`${MIGRATION_TAG_PREFIX}1`, `${MIGRATION_TAG_PREFIX}3`]);
  });
});
