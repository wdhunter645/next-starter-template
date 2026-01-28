#!/usr/bin/env node
/**
 * D1 Seeding Script - Programmatic, idempotent seeding for all D1 tables
 * 
 * Usage:
 *   node scripts/d1-seed-all.mjs [--env <environment>]
 * 
 * Environment: local (default), production, etc.
 * 
 * This script:
 * 1. Discovers all tables in the bound D1 database
 * 2. For each table, discovers columns and foreign keys
 * 3. Seeds tables in dependency order (FK parents first)
 * 4. Inserts rows per table based on TABLE_MIN_ROWS (default: 15, custom: photos=50, events=25, etc.)
 * 5. Uses Wikimedia Commons URLs for photo/media columns
 */

import { execSync } from 'child_process';
import crypto from 'crypto';

const MIN_ROWS = 15;

// Table-specific minimum row counts
const TABLE_MIN_ROWS = {
  'photos': 50,           // Need 50+ for photo archive
  'members': 20,          // Need decent member base
  'events': 25,           // Need events for calendar
  'milestones': 25,       // Need milestones for timeline
  'faq_entries': 20,      // Need FAQs for list
  'discussions': 15,      // Need discussions for forum
  'weekly_votes': 30,     // Need votes for matchup stats
};

// Wikimedia Commons photo URLs (Lou Gehrig collection)
const WIKIMEDIA_PHOTOS = [
  'https://commons.wikimedia.org/wiki/Special:FilePath/1923%20Lou%20Gehrig.png',
  'https://commons.wikimedia.org/wiki/Special:FilePath/1928%20Gehrig%20Speaker%20Cobb%20Ruth.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/1931%20Lou%20Gehrig%20United%20States%20Passport%20Photo.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Gehrig%20cropped.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lou%20Gehrig%201925.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lou%20Gehrig%20and%20Hank%20Greenberg%201935.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lou%20Gehrig%20holding%20a%20baseball%20bat.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lou%20Gehrig%20finishes%20his%2019th%20home%20run%20of%20the%20season%2C%20June%2019%2C%201929.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lou%20Gehrig%20beating%20ball%2C%20Aug%2027%2C%201928.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lou%20Gehrig%20as%20a%20new%20Yankee%2011%20Jun%201923.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lou%20Gehrig%20congratulating%20Babe%20Ruth%20with%20a%20kick%2C%20Oct.%209%2C%201928.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lou%20Gehrig%20Monument%20Park.JPG',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Gehrigsliding.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Babe%20Ruth%20%26%20Lou%20Gehrig%20at%20West%20Point%201927.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Jimmie%20Foxx%2C%20Babe%20Ruth%2C%20Lou%20Gehrig%2C%20Al%20Simmons.jpg',
];

class D1Seeder {
  constructor(env = 'local') {
    this.env = env;
    this.dbName = 'lgfc_lite';
  }

  /**
   * Execute a D1 command via wrangler
   */
  execD1(sql, silent = false) {
    const cmd = this.env === 'local'
      ? `npx wrangler d1 execute ${this.dbName} --local --command "${sql.replace(/"/g, '\\"')}"`
      : `npx wrangler d1 execute ${this.dbName} --env ${this.env} --command "${sql.replace(/"/g, '\\"')}"`;
    
    try {
      const result = execSync(cmd, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' });
      return result;
    } catch (error) {
      if (!silent) {
        console.error(`Failed to execute SQL: ${sql.substring(0, 100)}...`);
        throw error;
      }
      return null;
    }
  }

  /**
   * Query D1 and return results
   */
  queryD1(sql) {
    const cmd = this.env === 'local'
      ? `npx wrangler d1 execute ${this.dbName} --local --json --command "${sql.replace(/"/g, '\\"')}"`
      : `npx wrangler d1 execute ${this.dbName} --env ${this.env} --json --command "${sql.replace(/"/g, '\\"')}"`;
    
    try {
      const result = execSync(cmd, { encoding: 'utf-8' });
      const parsed = JSON.parse(result);
      return parsed[0]?.results || [];
    } catch (error) {
      console.error(`Query failed: ${sql}`);
      return [];
    }
  }

  /**
   * Get all tables (excluding system tables)
   */
  getTables() {
    const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'd1_migrations%' AND name NOT LIKE '_cf_%' ORDER BY name`;
    return this.queryD1(sql).map(row => row.name);
  }

  /**
   * Get table schema
   */
  getTableInfo(table) {
    const sql = `PRAGMA table_info(${table})`;
    return this.queryD1(sql);
  }

  /**
   * Get foreign keys for a table
   */
  getForeignKeys(table) {
    const sql = `PRAGMA foreign_key_list(${table})`;
    return this.queryD1(sql);
  }

  /**
   * Get current row count
   */
  getRowCount(table) {
    const result = this.queryD1(`SELECT COUNT(*) as count FROM ${table}`);
    return result[0]?.count || 0;
  }

  /**
   * Generate a deterministic fake UUID
   */
  generateUUID(table, col, n) {
    const hash = crypto.createHash('sha256')
      .update(`${table}:${col}:${n}`)
      .digest('hex');
    
    return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
  }

  /**
   * Determine if column is likely a photo/media URL
   */
  isPhotoUrlColumn(table, colName) {
    const urlPatterns = ['url', 'photo_url', 'image_url', 'src', 'public_url', 'asset_url'];
    
    return urlPatterns.some(p => colName.toLowerCase().includes(p));
  }

  /**
   * Escape SQL identifier (table/column name) for safe use in queries
   */
  escapeIdentifier(identifier) {
    // SQLite uses double quotes for identifiers
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  /**
   * Generate value for a column
   */
  generateValue(table, colInfo, type, n, isPk = false, isFk = false, fkTable = null) {
    // Handle foreign keys
    if (isFk && fkTable) {
      // For FK, we'll use the modulo to cycle through parent IDs
      const parentIds = this.queryD1(`SELECT id FROM ${fkTable} LIMIT ${MIN_ROWS}`);
      if (parentIds.length > 0) {
        return parentIds[n % parentIds.length].id;
      }
      return 1; // Fallback
    }

    // For TEXT primary keys, use UUID to ensure uniqueness
    if (isPk && type === 'TEXT') {
      return `'${this.generateUUID(table, colInfo.name, n)}'`;
    }

    // Photo/Media URL columns
    if (this.isPhotoUrlColumn(table, colInfo.name)) {
      return `'${WIKIMEDIA_PHOTOS[n % WIKIMEDIA_PHOTOS.length]}'`;
    }

    // Handle by column name patterns
    const colLower = colInfo.name.toLowerCase();
    
    if (colLower.includes('email')) {
      // For members table, use more realistic emails
      if (table.toLowerCase() === 'members') {
        const names = ['john.smith', 'jane.doe', 'bob.jones', 'alice.brown', 'charlie.davis', 
                       'diana.miller', 'evan.wilson', 'frank.moore', 'grace.taylor', 'henry.anderson',
                       'ivy.thomas', 'jack.jackson', 'karen.white', 'leo.harris', 'mary.martin'];
        return `'${names[n % names.length]}${n >= names.length ? n : ''}@example.com'`;
      }
      return `'user${n}@example.com'`;
    }
    
    if (colLower.includes('uuid') || colLower.includes('uid')) {
      return `'${this.generateUUID(table, colInfo.name, n)}'`;
    }
    
    if (colLower.includes('date') && type === 'TEXT') {
      // For events, spread dates across months
      if (table.toLowerCase() === 'events') {
        const baseDate = new Date('2026-01-15T00:00:00Z');
        baseDate.setDate(baseDate.getDate() + (n * 7)); // Weekly events
        return `'${baseDate.toISOString().split('T')[0]}'`;
      }
      const baseDate = new Date('2026-01-01T00:00:00Z');
      baseDate.setDate(baseDate.getDate() + n);
      return `'${baseDate.toISOString()}'`;
    }
    
    if (colLower.includes('year') && type === 'INTEGER') {
      // For milestones, use historical years
      if (table.toLowerCase() === 'milestones') {
        return 1923 + (n % 16); // 1923-1939 (Lou Gehrig's playing years)
      }
      return 1920 + (n % 20);
    }
    
    // Handle title columns with context-specific values
    if (colLower === 'title') {
      if (table.toLowerCase() === 'events') {
        const titles = [
          'Annual Lou Gehrig Day',
          'Baseball History Lecture',
          'Memorial Exhibition',
          'Fan Club Meetup',
          'Charity Baseball Game',
          'Documentary Screening',
          'Museum Tour',
          'Youth Baseball Clinic',
          'Hall of Fame Visit',
          'Vintage Baseball Game'
        ];
        return `'${titles[n % titles.length]}${n >= titles.length ? ' ' + (Math.floor(n / titles.length) + 1) : ''}'`;
      }
      if (table.toLowerCase() === 'milestones') {
        const milestones = [
          'Signed with Yankees',
          'First Home Run',
          'MVP Award',
          'World Series Victory',
          'Record Consecutive Games',
          'Triple Crown Season',
          'All-Star Selection',
          '500th Career RBI',
          'Retirement Announcement',
          'Hall of Fame Induction'
        ];
        return `'${milestones[n % milestones.length]}'`;
      }
      if (table.toLowerCase() === 'faq_entries') {
        return `'FAQ Question ${n + 1}'`;
      }
    }
    
    // Handle description columns
    if (colLower === 'description') {
      return `'This is a detailed description for ${table} row ${n + 1}. It provides context and information about this entry.'`;
    }
    
    // Handle photo-specific columns
    if (table.toLowerCase() === 'photos') {
      if (colLower === 'photo_id') {
        return `'photo_${this.generateUUID(table, colInfo.name, n).substring(0, 16)}'`;
      }
      if (colLower === 'era') {
        const eras = ['Early Career', 'Prime Years', 'Later Career', 'Championship Era'];
        return `'${eras[n % eras.length]}'`;
      }
      if (colLower === 'type') {
        const types = ['action', 'portrait', 'team', 'memorabilia', 'ceremony'];
        return `'${types[n % types.length]}'`;
      }
      if (colLower === 'game_context') {
        return `'Game ${(n % 162) + 1}, 19${23 + (n % 16)}'`;
      }
      if (colLower === 'people') {
        const people = ['Lou Gehrig', 'Babe Ruth', 'Lou Gehrig, Babe Ruth', 'Lou Gehrig, team', 'crowd'];
        return `'${people[n % people.length]}'`;
      }
      if (colLower === 'teams') {
        const teams = ['New York Yankees', 'Yankees vs Red Sox', 'Yankees vs Tigers', 'All-Stars'];
        return `'${teams[n % teams.length]}'`;
      }
      if (colLower === 'tags') {
        const tags = ['baseball', 'historic', 'vintage', 'action shot', 'portrait', 'team photo'];
        return `'${tags[n % tags.length]}'`;
      }
      if (colLower === 'source') {
        const sources = ['Wikimedia Commons', 'National Archives', 'Baseball Hall of Fame', 'Library of Congress'];
        return `'${sources[n % sources.length]}'`;
      }
      if (colLower === 'rights_notes') {
        return `'Public domain - sourced from Wikimedia Commons'`;
      }
    }

    // Handle by type
    switch (type) {
      case 'INTEGER':
        if (colLower.includes('status') || colLower.includes('approved') || 
            colLower.includes('memorabilia') || colLower.includes('featured') ||
            colLower.includes('eligible') || colLower.includes('opt')) {
          return n % 2;
        }
        return isPk ? null : n + 1;
      
      case 'REAL':
        return (n + 1) + 0.1;
      
      case 'TEXT':
      default:
        // Special handling for known columns
        if (colLower === 'status') {
          const statuses = ['posted', 'draft', 'approved', 'active', 'open'];
          return `'${statuses[n % statuses.length]}'`;
        }
        if (colLower === 'role') {
          return n === 0 ? "'admin'" : "'member'";
        }
        if (colLower === 'choice') {
          return n % 2 === 0 ? "'a'" : "'b'";
        }
        if (colLower === 'message_type') {
          return n % 2 === 0 ? "'welcome'" : "'admin'";
        }
        if (colLower === 'result') {
          const results = ['sent', 'failed', 'skipped'];
          return `'${results[n % results.length]}'`;
        }
        if (colLower === 'provider') {
          return "'email_provider'";
        }
        if (colLower === 'kind') {
          const kinds = ['charity', 'business', 'sponsor'];
          return `'${kinds[n % kinds.length]}'`;
        }
        if (colLower === 'location') {
          const locations = [
            'Yankee Stadium, Bronx NY',
            'Columbia University, New York NY',
            'Baseball Hall of Fame, Cooperstown NY',
            'Lou Gehrig Memorial Park, New Rochelle NY',
            'New York Public Library',
            'Central Park, New York NY',
            'Madison Square Garden, New York NY',
            'Online Event (Virtual)',
            'Community Center, Manhattan NY',
            'Sports Museum, New York NY'
          ];
          return `'${locations[n % locations.length]}'`;
        }
        if (colLower === 'host') {
          const hosts = [
            'Lou Gehrig Fan Club',
            'New York Yankees Foundation',
            'Baseball History Society',
            'ALS Research Foundation',
            'Sports Heritage Museum',
            'Community Baseball League',
            'Youth Sports Foundation',
            'Hall of Fame Association'
          ];
          return `'${hosts[n % hosts.length]}'`;
        }
        if (colLower === 'fees') {
          const fees = ['Free', '$10', '$25', '$50', 'Members Free, $15 for guests', 'Donation suggested'];
          return `'${fees[n % fees.length]}'`;
        }
        if (colLower === 'external_url') {
          return `'https://example.com/event-${n + 1}'`;
        }
        if (colLower === 'source_hash') {
          return `'${this.generateUUID(table, colInfo.name, n)}'`;
        }
        if (colLower === 'week_start') {
          // Generate Monday dates
          const baseDate = new Date('2026-01-05T00:00:00Z'); // A Monday
          baseDate.setDate(baseDate.getDate() + (n * 7));
          return `'${baseDate.toISOString().split('T')[0]}'`;
        }
        
        return `'${table}_${colInfo.name}_${n}'`;
    }
  }

  /**
   * Seed a single table
   */
  seedTable(table) {
    console.log(`\n📊 Seeding table: ${table}`);
    
    const currentCount = this.getRowCount(table);
    const targetRows = TABLE_MIN_ROWS[table] || MIN_ROWS;
    console.log(`   Current rows: ${currentCount} (target: ${targetRows})`);
    
    if (currentCount >= targetRows) {
      console.log(`   ✅ Already has ${targetRows}+ rows, skipping`);
      return;
    }
    
    const needed = targetRows - currentCount;
    console.log(`   Inserting ${needed} rows...`);
    
    const columns = this.getTableInfo(table);
    const foreignKeys = this.getForeignKeys(table);
    
    // Filter columns: skip auto-increment PKs and columns with defaults
    const insertColumns = columns.filter(col => {
      const isPk = col.pk === 1;
      // SQLite returns "null" as string, not actual null
      const hasDefault = col.dflt_value !== null && col.dflt_value !== 'null';
      const isAutoIncrement = isPk && col.type === 'INTEGER';
      
      return !isAutoIncrement && !hasDefault;
    });
    
    // Build FK map
    const fkMap = {};
    foreignKeys.forEach(fk => {
      fkMap[fk.from] = fk.table;
    });
    
    // Insert rows
    for (let i = 0; i < needed; i++) {
      const rowNum = currentCount + i;
      const values = insertColumns.map(col => {
        const isFk = fkMap[col.name] !== undefined;
        const fkTable = fkMap[col.name];
        const isPk = col.pk === 1;
        
        return this.generateValue(table, col, col.type, rowNum, isPk, isFk, fkTable);
      }).filter(v => v !== null);
      
      if (values.length > 0) {
        const colNames = insertColumns.map(c => this.escapeIdentifier(c.name)).join(', ');
        const escapedTable = this.escapeIdentifier(table);
        const sql = `INSERT INTO ${escapedTable} (${colNames}) VALUES (${values.join(', ')})`;
        
        try {
          this.execD1(sql, true);
        } catch (error) {
          console.error(`   ⚠️  Failed to insert row ${i + 1}: ${error.message}`);
        }
      }
    }
    
    const finalCount = this.getRowCount(table);
    console.log(`   ✅ Final count: ${finalCount} rows`);
  }

  /**
   * Determine table dependency order (topological sort)
   */
  getTableOrder(tables) {
    const dependencies = {};
    const inDegree = {};
    
    // Initialize
    tables.forEach(table => {
      dependencies[table] = [];
      inDegree[table] = 0;
    });
    
    // Build dependency graph
    tables.forEach(table => {
      const fks = this.getForeignKeys(table);
      fks.forEach(fk => {
        if (tables.includes(fk.table) && fk.table !== table) {
          dependencies[fk.table].push(table);
          inDegree[table]++;
        }
      });
    });
    
    // Topological sort (Kahn's algorithm)
    const queue = [];
    const result = [];
    
    tables.forEach(table => {
      if (inDegree[table] === 0) {
        queue.push(table);
      }
    });
    
    while (queue.length > 0) {
      const table = queue.shift();
      result.push(table);
      
      dependencies[table].forEach(dependent => {
        inDegree[dependent]--;
        if (inDegree[dependent] === 0) {
          queue.push(dependent);
        }
      });
    }
    
    // Handle cycles - add remaining tables
    tables.forEach(table => {
      if (!result.includes(table)) {
        result.push(table);
      }
    });
    
    return result;
  }

  /**
   * Main seeding entry point
   */
  async seed() {
    console.log(`\n🌱 D1 Seeding started (environment: ${this.env})`);
    console.log(`   Database: ${this.dbName}`);
    console.log(`   Default target: ${MIN_ROWS} rows per table`);
    console.log(`   Special targets: photos=${TABLE_MIN_ROWS.photos}, members=${TABLE_MIN_ROWS.members}, events=${TABLE_MIN_ROWS.events}\n`);
    
    // Get all tables
    const tables = this.getTables();
    console.log(`📋 Found ${tables.length} tables:\n   ${tables.join(', ')}\n`);
    
    // Determine seeding order
    const orderedTables = this.getTableOrder(tables);
    console.log(`📐 Seeding order (FK-aware):\n   ${orderedTables.join(' → ')}\n`);
    
    // Seed each table
    orderedTables.forEach(table => {
      this.seedTable(table);
    });
    
    console.log(`\n✅ Seeding complete!`);
    console.log(`\n📊 Run './scripts/d1-report.sh ${this.env}' to verify row counts.\n`);
  }
}

// Main execution
const args = process.argv.slice(2);
let env = 'local';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--env' && args[i + 1]) {
    env = args[i + 1];
    break;
  }
}

const seeder = new D1Seeder(env);
seeder.seed().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
