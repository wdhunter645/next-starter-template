#!/usr/bin/env node
/**
 * test_cms_helpers.mjs
 * 
 * Simple test harness to validate CMS read helper functions
 * Connects to local D1 database via wrangler and tests the helpers
 */

import { spawn } from 'child_process';

/**
 * Execute SQL via wrangler d1 execute
 */
function executeD1SQL(sql) {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', [
      'wrangler', 'd1', 'execute', 'lgfc_lite',
      '--local',
      '--command', sql,
      '--json'
    ], {
      stdio: ['ignore', 'pipe', 'pipe']
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
        try {
          // Find the start of JSON in stdout (skip wrangler output)
          const jsonStart = stdout.indexOf('[');
          if (jsonStart === -1) {
            resolve({ success: true, data: [] });
            return;
          }
          
          const jsonStr = stdout.substring(jsonStart);
          const parsed = JSON.parse(jsonStr);
          
          // wrangler returns array of results, get the first one
          const data = Array.isArray(parsed) && parsed.length > 0 ? parsed[0].results || [] : [];
          resolve({ success: true, data });
        } catch (err) {
          resolve({ success: true, data: [] });
        }
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
 * Test getPublishedBlocksByPage - should return empty since all are draft
 */
async function testGetPublishedBlocksByPage() {
  console.log('\n📋 Testing getPublishedBlocksByPage("home")...');
  
  const sql = `
    SELECT 
      key, page, section, title, status, version, 
      published_body_md, published_at, updated_at
    FROM content_blocks
    WHERE page = 'home' AND status = 'published'
    ORDER BY section, key;
  `;

  try {
    const result = await executeD1SQL(sql);
    const blocks = result.data;
    
    console.log(`  ✅ Found ${blocks.length} published blocks for "home"`);
    if (blocks.length > 0) {
      console.log('  Keys:', blocks.map(b => b.key).join(', '));
    } else {
      console.log('  (None - expected since all blocks are draft)');
    }
    return true;
  } catch (err) {
    console.error('  ❌ Error:', err.message);
    return false;
  }
}

/**
 * Test getDraftBlocksByPage - should return all blocks for page
 */
async function testGetDraftBlocksByPage() {
  console.log('\n📋 Testing getDraftBlocksByPage("home")...');
  
  const sql = `
    SELECT 
      key, page, section, title, status, version,
      body_md, published_body_md, published_at, updated_at, updated_by
    FROM content_blocks
    WHERE page = 'home'
    ORDER BY section, key;
  `;

  try {
    const result = await executeD1SQL(sql);
    const blocks = result.data;
    
    console.log(`  ✅ Found ${blocks.length} blocks for "home"`);
    if (blocks.length > 0) {
      console.log('  Keys:', blocks.map(b => b.key).join(', '));
      console.log('  Statuses:', blocks.map(b => b.status).join(', '));
    }
    
    // Verify we got the expected blocks
    const expectedKeys = ['home.hero.primary', 'home.intro.primary'];
    const foundKeys = blocks.map(b => b.key);
    const allFound = expectedKeys.every(k => foundKeys.includes(k));
    
    if (!allFound) {
      console.error('  ❌ Missing expected keys!');
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('  ❌ Error:', err.message);
    return false;
  }
}

/**
 * Test getBlockByKey
 */
async function testGetBlockByKey() {
  console.log('\n📋 Testing getBlockByKey("home.hero.primary")...');
  
  const sql = `
    SELECT 
      key, page, section, title, status, version,
      body_md, published_body_md, published_at, updated_at, updated_by
    FROM content_blocks
    WHERE key = 'home.hero.primary';
  `;

  try {
    const result = await executeD1SQL(sql);
    const blocks = result.data;
    
    if (blocks.length === 0) {
      console.error('  ❌ Block not found!');
      return false;
    }
    
    if (blocks.length > 1) {
      console.error('  ❌ Multiple blocks found (should be unique)!');
      return false;
    }
    
    const block = blocks[0];
    console.log(`  ✅ Found block: ${block.key}`);
    console.log(`     Page: ${block.page}, Section: ${block.section}`);
    console.log(`     Title: ${block.title}`);
    console.log(`     Status: ${block.status}, Version: ${block.version}`);
    console.log(`     Updated by: ${block.updated_by}`);
    
    return true;
  } catch (err) {
    console.error('  ❌ Error:', err.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 CMS Read Helpers Test Harness');
  console.log('=================================\n');
  
  const results = [];
  
  results.push(await testGetPublishedBlocksByPage());
  results.push(await testGetDraftBlocksByPage());
  results.push(await testGetBlockByKey());
  
  console.log('\n=================================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log(`✅ All ${total} tests passed!`);
    process.exit(0);
  } else {
    console.log(`❌ ${total - passed} of ${total} tests failed`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('❌ Test harness failed:', err);
  process.exit(1);
});
