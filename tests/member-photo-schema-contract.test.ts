import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

function applyAllMigrations(db: DatabaseSync) {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    db.exec(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
  }
}

function columnNames(db: DatabaseSync, table: string): string[] {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.map((row) => row.name);
}

describe('#3119 member-photo schema contract (migration 0045)', () => {
  it('adds the expected additive columns to photos without a destructive rebuild', () => {
    const db = new DatabaseSync(':memory:');
    applyAllMigrations(db);

    const columns = columnNames(db, 'photos');
    for (const expected of [
      'id',
      'url',
      'is_memorabilia',
      'description',
      'created_at',
      'status',
      'submitted_by',
      'submitted_at',
      'quarantine_key',
      'consent_confirmed',
      'credit_line',
      'rights_owner',
      'moderation_notes',
      'reviewed_by',
      'reviewed_at',
    ]) {
      expect(columns).toContain(expected);
    }

    db.close();
  });

  it('defaults pre-existing-shaped rows to status = published, preserving current gallery behavior', () => {
    const db = new DatabaseSync(':memory:');
    applyAllMigrations(db);

    db.exec(`INSERT INTO photos (url, description) VALUES ('legacy/photo.jpg', 'legacy row')`);
    const row = db.prepare(`SELECT status, consent_confirmed FROM photos WHERE url = 'legacy/photo.jpg'`).get() as
      | { status: string; consent_confirmed: number }
      | undefined;

    expect(row?.status).toBe('published');
    expect(row?.consent_confirmed).toBe(0);

    db.close();
  });

  it('accepts a pending member-submitted photo row with quarantine metadata', () => {
    const db = new DatabaseSync(':memory:');
    applyAllMigrations(db);

    db.exec(`
      INSERT INTO photos (url, description, status, submitted_by, submitted_at, quarantine_key, consent_confirmed, credit_line)
      VALUES ('quarantine/pending-key.jpg', 'member upload', 'pending', 'member@example.com', datetime('now'), 'quarantine/pending-key.jpg', 1, 'Photo by member@example.com')
    `);

    const row = db
      .prepare(`SELECT status, submitted_by, quarantine_key, consent_confirmed FROM photos WHERE submitted_by = 'member@example.com'`)
      .get() as { status: string; submitted_by: string; quarantine_key: string; consent_confirmed: number } | undefined;

    expect(row?.status).toBe('pending');
    expect(row?.quarantine_key).toBe('quarantine/pending-key.jpg');
    expect(row?.consent_confirmed).toBe(1);

    db.close();
  });

  it('creates photo_upload_attempts mirroring the login_attempts rate-limit shape', () => {
    const db = new DatabaseSync(':memory:');
    applyAllMigrations(db);

    const columns = columnNames(db, 'photo_upload_attempts');
    expect(columns).toEqual(['id', 'member_email', 'ip', 'ok', 'created_at']);

    db.close();
  });

  it('supports a deterministic 1-hour rate-limit window count keyed by member_email', () => {
    const db = new DatabaseSync(':memory:');
    applyAllMigrations(db);

    db.exec(`
      INSERT INTO photo_upload_attempts (member_email, ip, ok, created_at) VALUES
        ('member@example.com', '1.2.3.4', 0, datetime('now')),
        ('member@example.com', '1.2.3.4', 0, datetime('now')),
        ('member@example.com', '1.2.3.4', 1, datetime('now')),
        ('member@example.com', '1.2.3.4', 0, datetime('now', '-2 hours'))
    `);

    const row = db
      .prepare(
        `SELECT COUNT(1) AS n FROM photo_upload_attempts
         WHERE member_email = ? AND ok = 0 AND datetime(created_at) >= datetime('now', '-1 hour')`
      )
      .get('member@example.com') as { n: number } | undefined;

    expect(row?.n).toBe(2);

    db.close();
  });
});
