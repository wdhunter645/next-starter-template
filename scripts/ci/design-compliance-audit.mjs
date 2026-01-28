#!/usr/bin/env node

/**
 * Design Compliance Audit Script
 * 
 * Purpose: Monitor and report misalignment between as-built production/preview behavior
 * and documented design expectations.
 * 
 * - Fail-loud: exits non-zero when mismatches detected
 * - Non-blocking: NOT added to required PR checks
 * - Observability-only: no auto-fixing, no commits from CI
 */

import https from 'https';
import http from 'http';

const TARGET_URL = process.env.TARGET_URL || 'https://www.lougehrigfanclub.com';

// ANSI colors for output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const results = {
  passed: [],
  failed: []
};

/**
 * Fetch a URL and return response data
 */
async function fetchURL(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'LGFC-Design-Compliance-Audit/1.0',
        ...options.headers
      },
      // Don't follow redirects automatically - we want to check them
      ...options
    };

    const req = protocol.request(url, requestOptions, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Check if response is a redirect (3xx status code)
 */
function isRedirect(statusCode) {
  return statusCode >= 300 && statusCode < 400;
}

/**
 * Report a test result
 */
function report(passed, message) {
  if (passed) {
    results.passed.push(message);
  } else {
    results.failed.push(message);
  }
}

/**
 * 1) Homepage sanity
 */
async function checkHomepageSanity() {
  console.log('\n🔍 Checking homepage sanity...');
  
  try {
    const res = await fetchURL(TARGET_URL);
    
    // Check status code
    if (res.statusCode === 200) {
      report(true, 'Homepage returns 200');
    } else {
      report(false, `Homepage returned ${res.statusCode} (expected 200)`);
    }
    
    // Check for infinite loading markers
    const loadingMarkers = ['Loading matchup', 'Loading…'];
    let foundLoading = false;
    
    for (const marker of loadingMarkers) {
      if (res.body.includes(marker)) {
        report(false, `Homepage contains "${marker}" (infinite loading indicator)`);
        foundLoading = true;
      }
    }
    
    if (!foundLoading) {
      report(true, 'Homepage does not contain loading indicators');
    }
  } catch (error) {
    report(false, `Homepage fetch failed: ${error.message}`);
  }
}

/**
 * 2) Auth-state correctness (logged-out)
 */
async function checkAuthState() {
  console.log('\n🔍 Checking auth state (logged-out)...');
  
  try {
    const res = await fetchURL(TARGET_URL);
    
    const authMarkers = ['Logout', 'Club Home'];
    let foundAuthElement = false;
    
    for (const marker of authMarkers) {
      if (res.body.includes(marker)) {
        report(false, `Homepage contains "${marker}" while logged out`);
        foundAuthElement = true;
      }
    }
    
    if (!foundAuthElement) {
      report(true, 'Homepage does not contain auth-only elements when logged out');
    }
  } catch (error) {
    report(false, `Auth state check failed: ${error.message}`);
  }
}

/**
 * 3) Route gating
 */
async function checkRouteGating() {
  console.log('\n🔍 Checking route gating...');
  
  try {
    const fanclubURL = new URL('/fanclub', TARGET_URL).toString();
    const res = await fetchURL(fanclubURL);
    
    // /fanclub should redirect (3xx) when unauthenticated, not return 200
    if (isRedirect(res.statusCode)) {
      report(true, `/fanclub returns redirect (${res.statusCode}) for unauthenticated request`);
    } else if (res.statusCode === 200) {
      report(false, `/fanclub returned 200 (expected redirect for unauthenticated user)`);
    } else {
      report(false, `/fanclub returned unexpected status ${res.statusCode}`);
    }
  } catch (error) {
    report(false, `Route gating check failed: ${error.message}`);
  }
}

/**
 * 4) Join/Login runtime health
 */
async function checkJoinLoginHealth() {
  console.log('\n🔍 Checking Join/Login runtime health...');
  
  const endpoints = ['/join', '/login'];
  
  for (const endpoint of endpoints) {
    try {
      const url = new URL(endpoint, TARGET_URL).toString();
      const res = await fetchURL(url);
      
      // Check status code
      if (res.statusCode === 200) {
        report(true, `${endpoint} returns 200`);
      } else {
        report(false, `${endpoint} returned ${res.statusCode} (expected 200)`);
      }
      
      // Check for missing_env marker
      if (res.body.includes('missing_env')) {
        report(false, `${endpoint} contains "missing_env" marker`);
      } else {
        report(true, `${endpoint} does not contain "missing_env" marker`);
      }
    } catch (error) {
      report(false, `${endpoint} check failed: ${error.message}`);
    }
  }
}

/**
 * 5) Contact / Support
 */
async function checkContactSupport() {
  console.log('\n🔍 Checking Contact/Support pages...');
  
  const endpoints = ['/contact', '/support'];
  
  for (const endpoint of endpoints) {
    try {
      const url = new URL(endpoint, TARGET_URL).toString();
      const res = await fetchURL(url);
      
      // Check status code
      if (res.statusCode === 200) {
        report(true, `${endpoint} returns 200`);
      } else {
        report(false, `${endpoint} returned ${res.statusCode} (expected 200)`);
      }
      
      // Check for Cloudflare email protection redirect
      if (res.body.includes('/cdn-cgi/l/email-protection')) {
        report(false, `${endpoint} contains Cloudflare email protection redirect`);
      } else {
        report(true, `${endpoint} does not contain email protection redirect`);
      }
    } catch (error) {
      report(false, `${endpoint} check failed: ${error.message}`);
    }
  }
}

/**
 * Generate and print mismatch report
 */
function printMismatchReport() {
  console.log('\n' + '='.repeat(80));
  console.log('DESIGN COMPLIANCE AUDIT — MISMATCH REPORT');
  console.log('='.repeat(80));
  console.log(`\nTarget URL: ${TARGET_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);
  
  if (results.failed.length > 0) {
    console.log(`${RED}FAILURES (${results.failed.length}):${RESET}`);
    results.failed.forEach((msg) => {
      console.log(`  ${RED}✗${RESET} FAIL: ${msg}`);
    });
    console.log('');
  }
  
  if (results.passed.length > 0) {
    console.log(`${GREEN}PASSED (${results.passed.length}):${RESET}`);
    results.passed.forEach((msg) => {
      console.log(`  ${GREEN}✓${RESET} PASS: ${msg}`);
    });
    console.log('');
  }
  
  console.log('='.repeat(80));
  
  if (results.failed.length > 0) {
    console.log(`\n${RED}AUDIT FAILED${RESET}: ${results.failed.length} mismatch(es) detected`);
    console.log('\nNext Steps:');
    console.log('  1. Review failures above');
    console.log('  2. Triage each mismatch as either:');
    console.log('     - Code/config fix (as-built should match as-designed), OR');
    console.log('     - Documentation update (as-designed should match as-built)');
    console.log('  3. Address mismatches in a follow-up PR');
  } else {
    console.log(`\n${GREEN}AUDIT PASSED${RESET}: No mismatches detected`);
  }
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting Design Compliance Audit...');
  console.log(`Target: ${TARGET_URL}`);
  
  // Run all checks
  await checkHomepageSanity();
  await checkAuthState();
  await checkRouteGating();
  await checkJoinLoginHealth();
  await checkContactSupport();
  
  // Print report
  printMismatchReport();
  
  // Exit with non-zero status if any failures
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Audit script error:', error);
  process.exit(1);
});
