#!/usr/bin/env node
/**
 * seed_cms_content_blocks.mjs
 * 
 * Purpose: Idempotent seed for CMS content_blocks table
 * Seeds baseline draft placeholders for all public pages
 * 
 * Usage:
 *   node scripts/seed_cms_content_blocks.mjs
 * 
 * Requirements:
 *   - wrangler CLI installed
 *   - D1 database configured in wrangler.toml
 *   - Migration 0011_cms_content_blocks.sql applied
 */

import { spawn } from 'child_process';

// Seed data: key, page, section, title, body_md
const SEED_BLOCKS = [
  {
    key: 'home.hero.primary',
    page: 'home',
    section: 'hero',
    title: 'Hero Section',
    body_md: 'Welcome to the Lou Gehrig Fan Club. This is a placeholder for the hero section.'
  },
  {
    key: 'home.intro.primary',
    page: 'home',
    section: 'intro',
    title: 'Introduction',
    body_md: 'This is a placeholder introduction for the home page.'
  },
  {
    key: 'about.bio.primary',
    page: 'about',
    section: 'bio',
    title: 'About Section',
    body_md: 'This is a placeholder for the about page bio section.'
  },
  {
    key: 'charities.overview.primary',
    page: 'charities',
    section: 'overview',
    title: 'Charities Overview',
    body_md: 'This is a placeholder for the charities overview section.'
  },
  {
    key: 'events.intro.primary',
    page: 'events',
    section: 'intro',
    title: 'Events Introduction',
    body_md: 'This is a placeholder for the events introduction section.'
  },
  {
    key: 'library.intro.primary',
    page: 'library',
    section: 'intro',
    title: 'Library Introduction',
    body_md: 'This is a placeholder for the library introduction section.'
  },
  {
    key: 'photos.intro.primary',
    page: 'photos',
    section: 'intro',
    title: 'Photos Introduction',
    body_md: 'This is a placeholder for the photos introduction section.'
  },
  {
    key: 'memorabilia.intro.primary',
    page: 'memorabilia',
    section: 'intro',
    title: 'Memorabilia Introduction',
    body_md: 'This is a placeholder for the memorabilia introduction section.'
  },
  {
    key: 'join.intro.primary',
    page: 'join',
    section: 'intro',
    title: 'Join Introduction',
    body_md: 'This is a placeholder for the join page introduction section.'
  }
];

/**
 * Execute SQL via wrangler d1 execute
 */
function executeD1SQL(sql) {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', [
      'wrangler', 'd1', 'execute', 'lgfc_lite',
      '--local',
      '--command', sql
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`wrangler exit code ${code}: ${stderr}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main seeding function
 */
async function seedCMSBlocks() {
  console.log('🌱 Seeding CMS content_blocks...\n');

  const now = new Date().toISOString();

  for (const block of SEED_BLOCKS) {
    const sql = `
      INSERT OR IGNORE INTO content_blocks (
        key, page, section, title, body_md, status, version, updated_at, updated_by
      ) VALUES (
        '${block.key}',
        '${block.page}',
        '${block.section}',
        '${block.title}',
        '${block.body_md.replace(/'/g, "''")}',
        'draft',
        1,
        '${now}',
        'seed'
      );
    `.trim();

    try {
      console.log(`  Seeding: ${block.key}`);
      await executeD1SQL(sql);
    } catch (err) {
      console.error(`  ❌ Failed to seed ${block.key}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\nVerify with:');
  console.log('  npx wrangler d1 execute lgfc_lite --local --command "SELECT key, page, status FROM content_blocks ORDER BY key;"');
}

// Run the seed
seedCMSBlocks().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
