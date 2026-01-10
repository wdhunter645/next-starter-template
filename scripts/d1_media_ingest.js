#!/usr/bin/env node
/**
 * D1 Media Ingest Script
 * ======================
 * 
 * Reads B2 inventory JSON and inserts only new, previously unseen objects into D1.
 * Fully idempotent: safe to re-run indefinitely.
 * 
 * Required environment variables:
 *   CLOUDFLARE_API_TOKEN  - Cloudflare API token with D1 access
 *   CLOUDFLARE_ACCOUNT_ID - Cloudflare account ID
 *   D1_DATABASE_NAME      - D1 database name (default: lgfc_lite)
 * 
 * Optional environment variables:
 *   DRY_RUN=1            - If set, generate SQL but do not execute
 *   VERBOSE=1            - Enable verbose logging
 * 
 * Input: Reads inventory JSON from stdin or file specified as first argument
 *        Format: {"objects": [{"key": "...", "size": N, "etag": "...", "file_id": "..."}]}
 * 
 * Logic:
 *   1. For each B2 object, compute stable media_uid
 *   2. Query D1 for existing media_uid records
 *   3. Insert only records not present in D1
 *   4. No UPDATEs, no DELETEs
 * 
 * Exit codes:
 *   0 - Success
 *   1 - General error
 *   2 - Configuration error
 */

const { readFileSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');

// Environment configuration
const DRY_RUN = process.env.DRY_RUN === '1';
const VERBOSE = process.env.VERBOSE === '1';
const D1_DATABASE_NAME = process.env.D1_DATABASE_NAME || 'lgfc_lite';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

// Validate required environment variables
if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
  console.error('ERROR: Missing required environment variables');
  console.error('Required: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID');
  process.exit(2);
}

// Helper: log messages
function log(message, ...args) {
  console.error(`[d1_media_ingest] ${message}`, ...args);
}

function verbose(message, ...args) {
  if (VERBOSE) {
    log(message, ...args);
  }
}

// Helper: generate stable media_uid from B2 metadata
// Strategy: Use b2_file_id + b2_key to create deterministic identifier
function generateMediaUid(b2FileId, b2Key) {
  // Combine file_id and key to create a stable, unique identifier
  // Using hash to bound the length and ensure URL-safety
  const combined = `${b2FileId}:${b2Key}`;
  const hash = createHash('sha256').update(combined).digest('hex');
  // Return first 40 chars for readability (still extremely unlikely to collide)
  return `b2_${hash.substring(0, 40)}`;
}

// Helper: SQL string escape
function sqlEscape(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Helper: execute wrangler D1 command
function executeWranglerD1(sql) {
  const args = [
    'd1', 'execute', D1_DATABASE_NAME,
    '--remote',
    '--command', sql
  ];
  
  try {
    const output = execFileSync('npx', ['wrangler', ...args], {
      encoding: 'utf8',
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN,
        CLOUDFLARE_ACCOUNT_ID
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    return output;
  } catch (error) {
    log('ERROR: wrangler d1 execute failed');
    log(error.stderr || error.message);
    throw error;
  }
}

// Helper: query D1 for existing media UIDs
function getExistingMediaUids(mediaUids) {
  if (mediaUids.length === 0) return new Set();
  
  // Build SQL query to check for existing UIDs
  const uidList = mediaUids.map(uid => sqlEscape(uid)).join(',');
  const query = `SELECT media_uid FROM media_assets WHERE media_uid IN (${uidList})`;
  
  verbose(`Querying D1 for ${mediaUids.length} existing records...`);
  
  try {
    const output = executeWranglerD1(query);
    
    // Parse wrangler output to extract media_uid values
    // Wrangler returns results in various formats; we need to handle JSON
    const existing = new Set();
    
    // Try to parse as JSON (newer wrangler versions)
    try {
      const results = JSON.parse(output);
      if (Array.isArray(results)) {
        results.forEach(row => {
          if (row.media_uid) existing.add(row.media_uid);
        });
      } else if (results.results && Array.isArray(results.results)) {
        results.results.forEach(row => {
          if (row.media_uid) existing.add(row.media_uid);
        });
      }
    } catch {
      // Fallback: parse text output
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('b2_')) {
          const match = line.match(/b2_[a-f0-9]+/);
          if (match) existing.add(match[0]);
        }
      }
    }
    
    verbose(`Found ${existing.size} existing records in D1`);
    return existing;
  } catch (error) {
    log('WARNING: Failed to query existing records, assuming none exist');
    return new Set();
  }
}

// Main processing function
function main() {
  // Read inventory from stdin or file argument
  let inventoryJson;
  const inputFile = process.argv[2];
  
  if (inputFile) {
    log(`Reading inventory from file: ${inputFile}`);
    inventoryJson = readFileSync(inputFile, 'utf8');
  } else {
    log('Reading inventory from stdin...');
    inventoryJson = readFileSync(0, 'utf8'); // Read from stdin
  }
  
  // Parse inventory
  let inventory;
  try {
    inventory = JSON.parse(inventoryJson);
  } catch (error) {
    log('ERROR: Failed to parse inventory JSON');
    log(error.message);
    process.exit(1);
  }
  
  const objects = inventory.objects || [];
  log(`Processing ${objects.length} objects from inventory`);
  
  if (objects.length === 0) {
    log('No objects to process, exiting');
    return;
  }
  
  // Generate media UIDs for all objects
  const objectsWithUids = objects.map(obj => ({
    ...obj,
    media_uid: generateMediaUid(obj.file_id, obj.key)
  }));
  
  // Query D1 for existing records (in batches to avoid query size limits)
  const BATCH_SIZE = 500;
  const allExisting = new Set();
  
  for (let i = 0; i < objectsWithUids.length; i += BATCH_SIZE) {
    const batch = objectsWithUids.slice(i, i + BATCH_SIZE);
    const batchUids = batch.map(obj => obj.media_uid);
    const existing = getExistingMediaUids(batchUids);
    existing.forEach(uid => allExisting.add(uid));
  }
  
  // Filter to only new objects
  const newObjects = objectsWithUids.filter(obj => !allExisting.has(obj.media_uid));
  
  log(`Found ${newObjects.length} new objects to insert`);
  log(`Skipping ${objects.length - newObjects.length} already-known objects`);
  
  if (newObjects.length === 0) {
    log('No new objects to insert, exiting');
    return;
  }
  
  // Generate INSERT statements
  const sqlStatements = ['BEGIN TRANSACTION;'];
  
  // Ensure index exists
  sqlStatements.push('CREATE UNIQUE INDEX IF NOT EXISTS idx_media_assets_media_uid ON media_assets(media_uid);');
  
  for (const obj of newObjects) {
    const { media_uid, key, file_id, size, etag } = obj;
    
    const sql = `INSERT OR IGNORE INTO media_assets (media_uid, b2_key, b2_file_id, size, etag) VALUES (${sqlEscape(media_uid)}, ${sqlEscape(key)}, ${sqlEscape(file_id)}, ${size || 0}, ${sqlEscape(etag)});`;
    sqlStatements.push(sql);
    
    verbose(`  Will insert: ${key} -> ${media_uid}`);
  }
  
  sqlStatements.push('COMMIT;');
  
  const fullSql = sqlStatements.join('\n');
  
  // Execute or print SQL
  if (DRY_RUN) {
    log('DRY_RUN mode: SQL would be executed:');
    console.log(fullSql);
  } else {
    log(`Executing ${newObjects.length} INSERT statements via wrangler...`);
    try {
      executeWranglerD1(fullSql);
      log('✓ Successfully inserted new records into D1');
    } catch (error) {
      log('ERROR: Failed to execute SQL');
      process.exit(1);
    }
  }
  
  // Summary
  log('');
  log('=== Ingestion Summary ===');
  log(`Total objects processed: ${objects.length}`);
  log(`New records inserted: ${newObjects.length}`);
  log(`Skipped (existing): ${objects.length - newObjects.length}`);
  log('========================');
}

// Run main
main();
