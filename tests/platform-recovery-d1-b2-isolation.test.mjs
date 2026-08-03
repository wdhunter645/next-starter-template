import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  APPLICATION_COMPAT_QUERIES,
  isToolingDisabled,
  proveB2CatalogRecovery,
  REQUIRED_RESTORED_TABLES,
  restoreD1ExportToIsolatedDb,
  runPlatformRecoveryD1B2Isolation,
} from '../scripts/ci/platform-recovery-d1-b2-isolation.mjs';

describe('platform-recovery-d1-b2-isolation helpers', () => {
  it('recognizes disable env', () => {
    expect(
      isToolingDisabled({ LGFC_PLATFORM_RECOVERY_D1_B2_ISOLATION_DISABLED: '1' }),
    ).toBe(true);
    expect(isToolingDisabled({})).toBe(false);
  });

  it('restores synthetic D1 export and passes application probes', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lgfc-2895-'));
    const dbPath = join(dir, 't.sqlite');
    try {
      const sql = `
CREATE TABLE media_assets (id INTEGER PRIMARY KEY, media_uid TEXT, b2_key TEXT, size INTEGER, etag TEXT);
CREATE TABLE photos (id INTEGER PRIMARY KEY, url TEXT);
CREATE TABLE members (id INTEGER PRIMARY KEY, email TEXT);
INSERT INTO media_assets VALUES (1,'u1','photos/a.jpg',10,'e1');
INSERT INTO photos VALUES (1,'https://cdn.example.test/a.jpg');
INSERT INTO members VALUES (1,'a@example.test');
`;
      const result = restoreD1ExportToIsolatedDb(sql, dbPath);
      expect(result.ok).toBe(true);
      for (const t of REQUIRED_RESTORED_TABLES) {
        expect(result.tables).toContain(t);
      }
      expect(result.compat.every((c) => c.ok)).toBe(true);
      expect(APPLICATION_COMPAT_QUERIES.length).toBeGreaterThanOrEqual(4);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reconciles B2 catalog to D1 refs and detects orphans', () => {
    const mediaRows = [
      { media_uid: 'u1', b2_key: 'photos/a.jpg', size: 10, etag: 'e1' },
    ];
    const catalog = {
      objects: [
        { key: 'photos/a.jpg', size: 10, etag: 'e1', sha256: 'a'.repeat(64) },
        { key: 'photos/orphan.jpg', size: 1, etag: 'e2', sha256: 'b'.repeat(64) },
      ],
    };
    const result = proveB2CatalogRecovery(catalog, mediaRows);
    expect(result.ok).toBe(true);
    expect(result.orphanCount).toBe(1);
  });
});

describe('platform-recovery-d1-b2-isolation runner', () => {
  it('disables without Production mutation', () => {
    const result = runPlatformRecoveryD1B2Isolation({
      env: { LGFC_PLATFORM_RECOVERY_D1_B2_ISOLATION_DISABLED: '1' },
      actorRole: 'test-runner',
    });
    expect(result.ok).toBe(true);
    expect(result.disabled).toBe(true);
    expect(result.productionMutation).toBe(false);
    expect(result.writeAttempts).toBe(0);
  });

  it('passes isolated D1 restore and B2 reconcile with fixtures', () => {
    const result = runPlatformRecoveryD1B2Isolation({ actorRole: 'test-runner' });
    expect(result.disabled).toBe(false);
    expect(result.productionMutation).toBe(false);
    expect(result.sourceIssue).toBe('#2895');
    expect(result.parentProject).toBe('#2779');
    expect(result.cleanupOk).toBe(true);
    expect(result.ok).toBe(true);
    expect(result.summary.recommendation).toBe('D1_B2_ISOLATION_PROOF_READY_FOR_REVIEW');
    expect(result.measured.d1RestoreMs).toBeGreaterThanOrEqual(0);
    expect(result.b2.objectCount).toBeGreaterThanOrEqual(3);
    expect(result.limitations.length).toBeGreaterThan(0);
  });
});
