// Pilot seed content and verification helpers for Program #1255 Task 009.

import pilotPackJson from '../../seed/content/pilot-pack.json';
import {
  countPublishedInventoryForSection,
  fetchRelatedInventoryStories,
  fetchSearchInventoryResults,
  LIBRARY_SECTION,
  publishedInventoryWhere,
  RELATED_CONTENT_SECTION,
  resolveMemberLibrarySearchResults,
  SEARCH_SECTION,
} from './content-inventory-public';

export const PILOT_EXAMPLE_CATEGORIES = [
  'canonical',
  'alternate',
  'media_associated',
  'event_year',
  'workflow_verification',
  'rejected_queue',
] as const;

export type PilotExampleCategory = (typeof PILOT_EXAMPLE_CATEGORIES)[number];

export type PilotInventoryFixture = {
  example_category: PilotExampleCategory;
  record: Record<string, unknown>;
};

export type PilotQueueFixture = {
  example_category: PilotExampleCategory;
  record: Record<string, unknown>;
};

export type PilotPhotoFixture = {
  example_category: PilotExampleCategory;
  record: Record<string, unknown>;
};

export type PilotMediaAssociationFixture = {
  example_category: PilotExampleCategory;
  record: Record<string, unknown>;
};

export type PilotContentPack = {
  version: string;
  marker: string;
  tag_prefix: string;
  description: string;
  inventory: PilotInventoryFixture[];
  queue: PilotQueueFixture[];
  photos: PilotPhotoFixture[];
  media_associations: PilotMediaAssociationFixture[];
};

export type PilotSqlStatement = {
  table: string;
  sql: string;
  description: string;
};

export type PilotPackValidationResult =
  | { ok: true; categories: Record<PilotExampleCategory, boolean> }
  | { ok: false; errors: string[] };

export type PilotVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type PilotVerificationResult = {
  ok: boolean;
  checks: PilotVerificationCheck[];
};

export const PILOT_CONTENT_PACK = pilotPackJson as PilotContentPack;

function sqlString(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlInteger(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(Math.trunc(parsed)) : 'NULL';
}

export function isPilotTaggedValue(value: unknown, pack: PilotContentPack = PILOT_CONTENT_PACK): boolean {
  const text = String(value || '').trim().toLowerCase();
  return text.startsWith(pack.tag_prefix.toLowerCase());
}

export function isPilotInventoryRow(
  row: Record<string, unknown>,
  pack: PilotContentPack = PILOT_CONTENT_PACK,
): boolean {
  return isPilotTaggedValue(row.tag, pack);
}

export function isPilotQueueRow(
  row: Record<string, unknown>,
  pack: PilotContentPack = PILOT_CONTENT_PACK,
): boolean {
  return (
    isPilotTaggedValue(row.proposed_tag, pack) ||
    String(row.review_notes || '').toLowerCase().includes(pack.marker.toLowerCase())
  );
}

export function isPilotPhotoRow(
  row: Record<string, unknown>,
  pack: PilotContentPack = PILOT_CONTENT_PACK,
): boolean {
  const photoId = String(row.photo_id || '').toLowerCase();
  return photoId.startsWith(pack.tag_prefix.toLowerCase());
}

export function flattenPilotRecords<T extends { record: Record<string, unknown> }>(items: T[]): Record<string, unknown>[] {
  return items.map((item) => ({ ...item.record }));
}

export function pilotRecordsByCategory(
  pack: PilotContentPack = PILOT_CONTENT_PACK,
): Record<PilotExampleCategory, Record<string, unknown>[]> {
  const grouped = Object.fromEntries(
    PILOT_EXAMPLE_CATEGORIES.map((category) => [category, [] as Record<string, unknown>[]]),
  ) as Record<PilotExampleCategory, Record<string, unknown>[]>;

  for (const item of pack.inventory) {
    grouped[item.example_category].push(item.record);
  }
  for (const item of pack.queue) {
    grouped[item.example_category].push(item.record);
  }
  for (const item of pack.photos) {
    grouped[item.example_category].push(item.record);
  }
  for (const item of pack.media_associations) {
    grouped[item.example_category].push(item.record);
  }

  return grouped;
}

export function validatePilotPack(pack: PilotContentPack = PILOT_CONTENT_PACK): PilotPackValidationResult {
  const errors: string[] = [];
  const categories = Object.fromEntries(
    PILOT_EXAMPLE_CATEGORIES.map((category) => [category, false]),
  ) as Record<PilotExampleCategory, boolean>;

  const markCategory = (category: PilotExampleCategory) => {
    categories[category] = true;
  };

  for (const item of pack.inventory) {
    markCategory(item.example_category);
    const record = item.record;
    if (!isPilotTaggedValue(record.tag, pack)) {
      errors.push(`Inventory row ${record.id} is missing the pilot tag prefix.`);
    }
    if (!String(record.credit_line || '').trim()) {
      errors.push(`Inventory row ${record.id} is missing credit_line.`);
    }
    if (record.status === 'published' && !String(record.source_name || '').trim()) {
      errors.push(`Published inventory row ${record.id} is missing source_name.`);
    }
  }

  for (const item of pack.queue) {
    markCategory(item.example_category);
    const record = item.record;
    if (!String(record.title || '').trim() || !String(record.description || '').trim()) {
      errors.push(`Queue row ${record.submission_id} is missing title or description.`);
    }
  }

  const canonicalRows = pack.inventory.filter((item) => item.example_category === 'canonical');
  const alternateRows = pack.inventory.filter((item) => item.example_category === 'alternate');
  if (canonicalRows.length < 1) {
    errors.push('Pilot pack must include at least one canonical inventory example.');
  }
  if (alternateRows.length < 1) {
    errors.push('Pilot pack must include at least one alternate inventory example.');
  }
  if (canonicalRows[0] && alternateRows[0] && canonicalRows[0].record.tag !== alternateRows[0].record.tag) {
    errors.push('Canonical and alternate examples must share the same tag.');
  }

  const mediaStory = pack.inventory.find((item) => item.example_category === 'media_associated');
  const mediaPhoto = pack.photos.find((item) => item.example_category === 'media_associated');
  const mediaAssociation = pack.media_associations.find((item) => item.example_category === 'media_associated');
  if (!mediaStory || !mediaPhoto || !mediaAssociation) {
    errors.push('Pilot pack must include inventory, photo, and association media examples.');
  } else if (
    Number(mediaAssociation.record.story_id) !== Number(mediaStory.record.id) ||
    Number(mediaAssociation.record.media_id) !== Number(mediaPhoto.record.id)
  ) {
    errors.push('Media association example must link the media-associated story and photo records.');
  }

  const eventYearRows = pack.inventory.filter((item) => item.example_category === 'event_year');
  if (!eventYearRows.some((item) => item.record.event_year !== null && item.record.event_year !== undefined)) {
    errors.push('Event-year example must include event_year.');
  }

  const rejectedRows = pack.queue.filter((item) => item.example_category === 'rejected_queue');
  if (!rejectedRows.some((item) => item.record.status === 'rejected')) {
    errors.push('Rejected queue example must use status = rejected.');
  }

  const workflowInventory = pack.inventory.filter((item) => item.example_category === 'workflow_verification');
  const workflowQueue = pack.queue.filter((item) => item.example_category === 'workflow_verification');
  if (workflowInventory.length < 1 || workflowQueue.length < 1) {
    errors.push('Workflow verification requires both a draft inventory row and a pending queue row.');
  }

  for (const category of PILOT_EXAMPLE_CATEGORIES) {
    if (!categories[category]) {
      errors.push(`Pilot pack is missing required example category: ${category}.`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, categories };
}

function inventoryInsertStatement(record: Record<string, unknown>): PilotSqlStatement {
  const columns = [
    'id',
    'tag',
    'title',
    'text',
    'summary',
    'story_type',
    'canonical',
    'perspective_label',
    'allowed_sections',
    'priority',
    'search_text',
    'source_name',
    'source_url',
    'credit_line',
    'event_date',
    'event_year',
    'rotation_group',
    'feature_weight',
    'status',
    'media',
    'review_notes',
    'submitted_by',
    'created_at',
    'updated_at',
    'published_at',
  ];

  const values = columns.map((column) => {
    if (column === 'canonical' || column === 'priority' || column === 'feature_weight' || column === 'event_year') {
      return sqlInteger(record[column]);
    }
    return sqlString(record[column] ?? null);
  });

  return {
    table: 'content_inventory',
    description: `Seed pilot inventory row ${record.id}`,
    sql: `INSERT OR REPLACE INTO content_inventory (${columns.join(', ')}) VALUES (${values.join(', ')});`,
  };
}

function queueInsertStatement(record: Record<string, unknown>): PilotSqlStatement {
  const columns = [
    'submission_id',
    'submitted_by',
    'payload',
    'title',
    'description',
    'source_name',
    'source_url',
    'credit_line',
    'proposed_tag',
    'media_url',
    'media_reference',
    'status',
    'triage_flags',
    'duplicate_candidate',
    'review_notes',
    'decision_by',
    'decision_at',
    'rejected_at',
    'purge_eligible_at',
    'purge_flag',
    'reviewer',
    'reviewed_at',
    'created_at',
    'updated_at',
  ];

  const values = columns.map((column) => {
    if (column === 'submission_id' || column === 'purge_flag') {
      return sqlInteger(record[column]);
    }
    return sqlString(record[column] ?? null);
  });

  return {
    table: 'submission_queue',
    description: `Seed pilot queue row ${record.submission_id}`,
    sql: `INSERT OR REPLACE INTO submission_queue (${columns.join(', ')}) VALUES (${values.join(', ')});`,
  };
}

function photoInsertStatement(record: Record<string, unknown>): PilotSqlStatement {
  const columns = ['id', 'photo_id', 'url', 'title', 'description', 'year', 'source', 'is_memorabilia', 'created_at'];
  const values = columns.map((column) => {
    if (column === 'id' || column === 'year' || column === 'is_memorabilia') {
      return sqlInteger(record[column]);
    }
    return sqlString(record[column] ?? null);
  });

  return {
    table: 'photos',
    description: `Seed pilot photo row ${record.id}`,
    sql: `INSERT OR REPLACE INTO photos (${columns.join(', ')}) VALUES (${values.join(', ')});`,
  };
}

function mediaAssociationInsertStatement(record: Record<string, unknown>): PilotSqlStatement {
  const columns = [
    'id',
    'story_id',
    'media_id',
    'media_role',
    'display_order',
    'caption',
    'alt_text',
    'source_name',
    'source_url',
    'credit_line',
    'created_at',
    'updated_at',
  ];

  const values = columns.map((column) => {
    if (column === 'id' || column === 'story_id' || column === 'media_id' || column === 'display_order') {
      return sqlInteger(record[column]);
    }
    return sqlString(record[column] ?? null);
  });

  return {
    table: 'content_inventory_media',
    description: `Seed pilot media association row ${record.id}`,
    sql: `INSERT OR REPLACE INTO content_inventory_media (${columns.join(', ')}) VALUES (${values.join(', ')});`,
  };
}

export function buildPilotSeedStatements(pack: PilotContentPack = PILOT_CONTENT_PACK): PilotSqlStatement[] {
  return [
    ...pack.photos.map((item) => photoInsertStatement(item.record)),
    ...pack.inventory.map((item) => inventoryInsertStatement(item.record)),
    ...pack.media_associations.map((item) => mediaAssociationInsertStatement(item.record)),
    ...pack.queue.map((item) => queueInsertStatement(item.record)),
  ];
}

export function buildPilotCleanupStatements(pack: PilotContentPack = PILOT_CONTENT_PACK): PilotSqlStatement[] {
  const inventoryIds = pack.inventory.map((item) => Number(item.record.id)).join(', ') || 'NULL';
  const queueIds = pack.queue.map((item) => Number(item.record.submission_id)).join(', ') || 'NULL';
  const photoIds = pack.photos.map((item) => Number(item.record.id)).join(', ') || 'NULL';
  const associationIds = pack.media_associations.map((item) => Number(item.record.id)).join(', ') || 'NULL';
  const tagLike = `${pack.tag_prefix.replace(/'/g, "''")}%`;

  return [
    {
      table: 'content_inventory_media',
      description: 'Remove pilot media associations by fixed id',
      sql: `DELETE FROM content_inventory_media WHERE id IN (${associationIds});`,
    },
    {
      table: 'content_inventory',
      description: 'Remove pilot inventory rows by fixed id and tag prefix',
      sql: `DELETE FROM content_inventory WHERE id IN (${inventoryIds}) OR tag LIKE '${tagLike}';`,
    },
    {
      table: 'submission_queue',
      description: 'Remove pilot queue rows by fixed id and proposed tag prefix',
      sql: `DELETE FROM submission_queue WHERE submission_id IN (${queueIds}) OR proposed_tag LIKE '${tagLike}';`,
    },
    {
      table: 'photos',
      description: 'Remove pilot photo rows by fixed id and photo_id prefix',
      sql: `DELETE FROM photos WHERE id IN (${photoIds}) OR photo_id LIKE '${tagLike}';`,
    },
  ];
}

export function pilotPublicInventoryRows(pack: PilotContentPack = PILOT_CONTENT_PACK): Record<string, unknown>[] {
  return pack.inventory
    .map((item) => item.record)
    .filter((row) => row.status === 'published' && isPilotInventoryRow(row, pack));
}

export function pilotExcludedInventoryRows(pack: PilotContentPack = PILOT_CONTENT_PACK): Record<string, unknown>[] {
  return pack.inventory
    .map((item) => item.record)
    .filter((row) => row.status !== 'published' && isPilotInventoryRow(row, pack));
}

export function pilotRejectedQueueRows(pack: PilotContentPack = PILOT_CONTENT_PACK): Record<string, unknown>[] {
  return pack.queue
    .map((item) => item.record)
    .filter((row) => row.status === 'rejected' && isPilotQueueRow(row, pack));
}

export function verifyPilotFixtureCoverage(
  pack: PilotContentPack = PILOT_CONTENT_PACK,
): PilotVerificationResult {
  const validation = validatePilotPack(pack);
  const checks: PilotVerificationCheck[] = [];

  if (validation.ok) {
    for (const category of PILOT_EXAMPLE_CATEGORIES) {
      checks.push({
        name: `fixture:${category}`,
        passed: validation.categories[category],
        detail: validation.categories[category]
          ? `Pilot pack includes ${category} example records.`
          : `Missing ${category} example records.`,
      });
    }
  } else {
    for (const error of validation.errors) {
      checks.push({
        name: 'fixture:validation',
        passed: false,
        detail: error,
      });
    }
  }

  const published = pilotPublicInventoryRows(pack);
  checks.push({
    name: 'fixture:source-and-credit',
    passed: published.every(
      (row) => String(row.source_name || '').trim() && String(row.credit_line || '').trim(),
    ),
    detail: 'Published pilot inventory rows include source_name and credit_line.',
  });

  return {
    ok: checks.every((check) => check.passed),
    checks,
  };
}

function matchesPublishedWhere(row: Record<string, unknown>, sectionKey: string): boolean {
  if (row.status !== 'published') return false;
  if (!String(row.allowed_sections || '').includes(sectionKey)) return false;
  if (!String(row.source_name || '').trim()) return false;
  if (!String(row.credit_line || '').trim()) return false;
  return true;
}

export function verifyPilotInclusionRules(
  inventoryRows: Record<string, unknown>[],
  pack: PilotContentPack = PILOT_CONTENT_PACK,
): PilotVerificationResult {
  const checks: PilotVerificationCheck[] = [];
  const pilotPublished = inventoryRows.filter(
    (row) => isPilotInventoryRow(row, pack) && row.status === 'published',
  );
  const pilotDraft = inventoryRows.filter(
    (row) => isPilotInventoryRow(row, pack) && row.status !== 'published',
  );

  for (const section of [LIBRARY_SECTION, SEARCH_SECTION, RELATED_CONTENT_SECTION]) {
    const expected = pilotPublished.filter((row) => matchesPublishedWhere(row, section));
    checks.push({
      name: `inclusion:${section}`,
      passed: expected.length > 0,
      detail: `${expected.length} published pilot rows are eligible for ${section}.`,
    });
  }

  const canonical = pilotPublished.find((row) => Number(row.canonical) === 1);
  const alternate = pilotPublished.find((row) => Number(row.canonical) !== 1);
  checks.push({
    name: 'inclusion:canonical-present',
    passed: Boolean(canonical),
    detail: canonical ? `Canonical pilot row ${canonical.id} is publish-eligible.` : 'Canonical pilot row missing.',
  });
  checks.push({
    name: 'inclusion:alternate-present',
    passed: Boolean(alternate),
    detail: alternate ? `Alternate pilot row ${alternate.id} is publish-eligible.` : 'Alternate pilot row missing.',
  });

  const eventYearRow = pilotPublished.find((row) => row.event_year !== null && row.event_year !== undefined);
  checks.push({
    name: 'inclusion:event-year-present',
    passed: Boolean(eventYearRow),
    detail: eventYearRow
      ? `Event-year pilot row ${eventYearRow.id} is publish-eligible.`
      : 'Event-year pilot row missing.',
  });

  checks.push({
    name: 'exclusion:draft-inventory',
    passed: pilotDraft.every((row) => !matchesPublishedWhere(row, LIBRARY_SECTION)),
    detail: 'Draft pilot inventory rows remain excluded from published inventory surfaces.',
  });

  return {
    ok: checks.every((check) => check.passed),
    checks,
  };
}

export function verifyPilotExclusionRules(
  inventoryRows: Record<string, unknown>[],
  queueRows: Record<string, unknown>[],
  pack: PilotContentPack = PILOT_CONTENT_PACK,
): PilotVerificationResult {
  const checks: PilotVerificationCheck[] = [];
  const rejected = queueRows.filter((row) => isPilotQueueRow(row, pack) && row.status === 'rejected');
  const pending = queueRows.filter(
    (row) => isPilotQueueRow(row, pack) && row.status !== 'approved' && row.status !== 'merged',
  );

  checks.push({
    name: 'exclusion:rejected-queue',
    passed: rejected.length > 0,
    detail: `${rejected.length} rejected pilot queue rows are isolated from inventory publication.`,
  });

  checks.push({
    name: 'exclusion:queue-not-inventory',
    passed: pending.every((row) => !inventoryRows.some((inv) => inv.tag === row.proposed_tag && inv.status === 'published')),
    detail: 'Pending or rejected pilot queue rows do not appear as published inventory rows.',
  });

  const draftRows = inventoryRows.filter((row) => isPilotInventoryRow(row, pack) && row.status === 'draft');
  checks.push({
    name: 'exclusion:draft-not-published',
    passed: draftRows.length > 0,
    detail: `${draftRows.length} draft pilot inventory rows remain unpublished.`,
  });

  return {
    ok: checks.every((check) => check.passed),
    checks,
  };
}

export async function verifyPilotPublicReads(
  inventoryRows: Record<string, unknown>[],
  mediaRows: Record<string, unknown>[],
  photoRows: Record<string, unknown>[],
  pack: PilotContentPack = PILOT_CONTENT_PACK,
): Promise<PilotVerificationResult> {
  const checks: PilotVerificationCheck[] = [];

  const firstResult = async (sql: string, args: unknown[] = []) => {
    if (sql.includes('sqlite_master')) {
      const table = String(args[0] || '');
      const tables = ['content_inventory', 'content_inventory_media', 'photos', 'library_entries'];
      return tables.includes(table) ? { name: table } : null;
    }
    if (sql.includes('COUNT(1)') && sql.includes('FROM content_inventory')) {
      const eligible = inventoryRows.filter((row) => {
        const sectionMatch = sql.match(/LIKE '%([^%]+)%'/);
        const section = sectionMatch?.[1] || LIBRARY_SECTION;
        return matchesPublishedWhere(row, section);
      });
      return { n: eligible.length };
    }
    return null;
  };

  const allResult = async (sql: string, args: unknown[] = []) => {
    let results = [...inventoryRows];
    if (sql.includes("status = 'published'")) {
      results = results.filter((row) => row.status === 'published');
    }
    if (sql.includes("LIKE '%library%'")) {
      results = results.filter((row) => String(row.allowed_sections || '').includes('library'));
    }
    if (sql.includes("LIKE '%search%'")) {
      results = results.filter((row) => String(row.allowed_sections || '').includes('search'));
    }
    if (sql.includes("LIKE '%related_content%'")) {
      results = results.filter((row) => String(row.allowed_sections || '').includes('related_content'));
    }
    if (sql.includes('source_name') && sql.includes("!= ''")) {
      results = results.filter((row) => String(row.source_name || '').trim());
    }
    if (sql.includes('credit_line') && sql.includes("!= ''")) {
      results = results.filter((row) => String(row.credit_line || '').trim());
    }

    const needleArg = args.find((arg) => typeof arg === 'string' && String(arg).includes('%'));
    if (typeof needleArg === 'string') {
      const needle = needleArg.replace(/%/g, '').toLowerCase();
      results = results.filter((row) => {
        const mediaText = mediaRows
          .filter((association) => Number(association.story_id) === Number(row.id))
          .map((association) => {
            const photo = photoRows.find((item) => Number(item.id) === Number(association.media_id));
            return [association.caption, association.alt_text, photo?.description, photo?.title]
              .map((part) => String(part ?? ''))
              .join(' ');
          })
          .join(' ');
        const fields = [
          row.title,
          row.text,
          row.summary,
          row.search_text,
          row.tag,
          row.source_name,
          row.credit_line,
          row.perspective_label,
          row.event_date,
          row.event_year,
          mediaText,
        ];
        return fields.some((field) => String(field ?? '').toLowerCase().includes(needle));
      });
    }

    if (sql.includes('event_year = ?')) {
      const yearArg = args.find((arg) => typeof arg === 'number');
      results = results.filter((row) => Number(row.event_year) === Number(yearArg));
    }

    if (sql.includes('ORDER BY canonical DESC')) {
      results = [...results].sort((a, b) => Number(b.canonical ?? 0) - Number(a.canonical ?? 0));
    }

    return { results };
  };

  const dbProxy = {
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => ({
        first: async () => firstResult(sql, args),
        all: async () => allResult(sql, args),
      }),
      first: async () => firstResult(sql),
      all: async () => allResult(sql),
    }),
  };

  const libraryCount = await countPublishedInventoryForSection(dbProxy, LIBRARY_SECTION);
  checks.push({
    name: 'public:library-count',
    passed: libraryCount > 0,
    detail: `Published pilot inventory count for library: ${libraryCount}.`,
  });

  const searchResults = await fetchSearchInventoryResults(dbProxy, {
    sectionKey: SEARCH_SECTION,
    q: 'farewell address',
    limit: 10,
  });
  checks.push({
    name: 'public:search-event-year',
    passed: searchResults.some((row) => row.year === 1939),
    detail: 'Search returns the event-year pilot story.',
  });

  const mediaSearchResults = await fetchSearchInventoryResults(dbProxy, {
    sectionKey: SEARCH_SECTION,
    q: 'yankee stadium portrait',
    limit: 10,
  });
  checks.push({
    name: 'public:search-media-associated',
    passed: mediaSearchResults.some((row) => String(row.tag || '').includes('lgfc-pilot-yankee-stadium-portrait')),
    detail: 'Search returns the media-associated pilot story.',
  });

  const librarySearch = await resolveMemberLibrarySearchResults(dbProxy, {
    q: 'iron horse',
    limit: 10,
  });
  checks.push({
    name: 'public:library-search-canonical',
    passed: librarySearch.items.some((row) => row.canonical),
    detail: 'Library search returns the canonical pilot story.',
  });

  const related = await fetchRelatedInventoryStories(dbProxy, {
    eventYear: 1939,
    limit: 5,
  });
  checks.push({
    name: 'public:related-event-year',
    passed: related.some((row) => row.year === 1939),
    detail: 'Related-content query returns the 1939 event-year pilot story.',
  });

  const draftMatches = await fetchSearchInventoryResults(dbProxy, {
    sectionKey: SEARCH_SECTION,
    q: 'first-story draft',
    limit: 10,
  });
  checks.push({
    name: 'public:draft-excluded',
    passed: !draftMatches.some((row) => String(row.tag || '').includes('lgfc-pilot-first-story-draft')),
    detail: 'Draft workflow verification inventory remains excluded from search.',
  });

  return {
    ok: checks.every((check) => check.passed),
    checks,
  };
}

export function pilotRollbackNotes(pack: PilotContentPack = PILOT_CONTENT_PACK): string[] {
  return [
    `Pilot seed marker: ${pack.marker} (version ${pack.version}).`,
    `Apply with buildPilotSeedStatements() using INSERT OR REPLACE for fixed pilot ids ${pack.inventory.map((item) => item.record.id).join(', ')}.`,
    `Cleanup with buildPilotCleanupStatements() to delete pilot rows by fixed id and ${pack.tag_prefix} tag prefix.`,
    'Cleanup is safe to run repeatedly; it does not delete non-pilot inventory or queue rows.',
    'Rejected pilot queue row 9102 remains excluded from public rendering and should be purged only through the approved editorial queue workflow.',
  ];
}

export function publishedInventoryWhereClause(sectionKey: string): string {
  return publishedInventoryWhere(sectionKey);
}
