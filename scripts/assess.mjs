#!/usr/bin/env node
/**
 * LGFC Site Assessment Harness
 * 
 * Validates:
 * - Build completes successfully
 * - Required routes exist in output
 * - Forbidden routes are absent
 * - Header/nav/footer invariants on key pages
 * - Basic page structure markers
 * 
 * Produces:
 * - reports/assess/assess-report.json (detailed results)
 * - reports/assess/assess-summary.md (human-readable summary)
 * 
 * Exit codes:
 * - 0: All checks passed
 * - 1: One or more checks failed
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  loadHTML,
  containsText,
  containsForbiddenText,
  extractHeadings,
  hasBasicStructure,
  routeToFilePath,
  validateFooterLinks,
  checkCopyrightYear,
  extractLinks
} from './lib/html-checks.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const MANIFEST_PATH = join(ROOT_DIR, 'docs/assess/manifest.json');
const OUTPUT_DIR = join(ROOT_DIR, 'out');
const REPORTS_DIR = join(ROOT_DIR, 'reports/assess');
const REPORT_JSON = join(REPORTS_DIR, 'assess-report.json');
const REPORT_MD = join(REPORTS_DIR, 'assess-summary.md');

// Parse CLI args
const args = process.argv.slice(2);
const isCI = args.includes('--ci');

/**
 * Main assessment runner
 */
async function main() {
  console.log('🔍 LGFC Site Assessment Harness');
  console.log('================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    mode: isCI ? 'ci' : 'local',
    checks: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  try {
    // Load manifest
    console.log('📋 Loading assessment manifest...');
    const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
    console.log(`   Loaded manifest v${manifest.version}\n`);

    // Step 1: Build the site
    console.log('🏗️  Building static site...');
    const buildResult = await runBuild();
    results.checks.push(buildResult);
    if (!buildResult.passed) {
      await saveResults(results);
      process.exit(1);
    }

    // Step 2: Validate required routes exist
    console.log('\n📂 Validating required routes...');
    const routesResult = await checkRequiredRoutes(manifest.requiredRoutes);
    results.checks.push(routesResult);

    // Step 3: Check forbidden routes are absent
    if (manifest.forbiddenRoutes && manifest.forbiddenRoutes.length > 0) {
      console.log('\n🚫 Checking forbidden routes...');
      const forbiddenResult = await checkForbiddenRoutes(manifest.forbiddenRoutes);
      results.checks.push(forbiddenResult);
    }

    // Step 4: Validate page markers on key pages
    console.log('\n✅ Validating page markers...');
    const markersResult = await checkPageMarkers(manifest.pageMarkers);
    results.checks.push(markersResult);

    // Step 5: Validate footer links
    console.log('\n🔗 Validating footer links...');
    const footerResult = await checkFooterLinks(manifest.footerLinks);
    results.checks.push(footerResult);

    // Calculate summary
    results.summary.total = results.checks.length;
    results.summary.passed = results.checks.filter(c => c.passed).length;
    results.summary.failed = results.summary.total - results.summary.passed;

    // Save results
    await saveResults(results);

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('ASSESSMENT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total checks: ${results.summary.total}`);
    console.log(`✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log('='.repeat(50) + '\n');

    if (results.summary.failed > 0) {
      console.error('❌ Assessment FAILED\n');
      process.exit(1);
    } else {
      console.log('✅ Assessment PASSED\n');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Assessment error:', error.message);
    results.checks.push({
      name: 'Assessment Error',
      passed: false,
      error: error.message,
      stack: error.stack
    });
    await saveResults(results);
    process.exit(1);
  }
}

/**
 * Run the Next.js build
 */
async function runBuild() {
  const result = {
    name: 'Build Static Site',
    passed: false,
    details: {}
  };

  try {
    console.log('   Running: npm run build:cf');
    const output = execSync('npm run build:cf', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    // Check if output directory exists
    if (!existsSync(OUTPUT_DIR)) {
      result.details.error = 'Output directory does not exist after build';
      console.log('   ❌ Build failed: output directory missing');
      return result;
    }

    result.passed = true;
    result.details.outputDir = OUTPUT_DIR;
    console.log('   ✅ Build completed successfully');
  } catch (error) {
    result.details.error = error.message;
    result.details.stderr = error.stderr?.toString();
    console.log('   ❌ Build failed');
  }

  return result;
}

/**
 * Check that all required routes exist
 */
async function checkRequiredRoutes(routes) {
  const result = {
    name: 'Required Routes',
    passed: true,
    details: {
      total: routes.length,
      found: [],
      missing: []
    }
  };

  for (const route of routes) {
    const filePaths = routeToFilePath(route, OUTPUT_DIR);
    
    // If route is '/', filePaths is a string
    if (typeof filePaths === 'string') {
      const exists = existsSync(filePaths);
      if (exists) {
        result.details.found.push(route);
        console.log(`   ✅ ${route} → ${filePaths}`);
      } else {
        result.details.missing.push(route);
        result.passed = false;
        console.log(`   ❌ ${route} → ${filePaths} (NOT FOUND)`);
      }
    } else {
      // Try both patterns
      let found = false;
      let foundPath = '';
      
      for (const filePath of filePaths) {
        if (existsSync(filePath)) {
          found = true;
          foundPath = filePath;
          break;
        }
      }
      
      if (found) {
        result.details.found.push(route);
        console.log(`   ✅ ${route} → ${foundPath}`);
      } else {
        result.details.missing.push(route);
        result.passed = false;
        console.log(`   ❌ ${route} → ${filePaths.join(' or ')} (NOT FOUND)`);
      }
    }
  }

  console.log(`\n   Found: ${result.details.found.length}/${result.details.total}`);
  
  return result;
}

/**
 * Check that forbidden routes do not exist
 */
async function checkForbiddenRoutes(routes) {
  const result = {
    name: 'Forbidden Routes',
    passed: true,
    details: {
      total: routes.length,
      absent: [],
      present: []
    }
  };

  for (const route of routes) {
    const filePaths = routeToFilePath(route, OUTPUT_DIR);
    
    // If route is '/', filePaths is a string
    let exists = false;
    if (typeof filePaths === 'string') {
      exists = existsSync(filePaths);
    } else {
      // Try both patterns
      for (const filePath of filePaths) {
        if (existsSync(filePath)) {
          exists = true;
          break;
        }
      }
    }
    
    if (!exists) {
      result.details.absent.push(route);
      console.log(`   ✅ ${route} is absent (as required)`);
    } else {
      result.details.present.push(route);
      result.passed = false;
      console.log(`   ❌ ${route} exists (should be absent)`);
    }
  }

  return result;
}

/**
 * Check page markers on key pages
 */
async function checkPageMarkers(pageMarkers) {
  const result = {
    name: 'Page Markers',
    passed: true,
    details: {
      pages: []
    }
  };

  for (const [route, markers] of Object.entries(pageMarkers)) {
    const filePaths = routeToFilePath(route, OUTPUT_DIR);
    let actualFilePath = null;
    
    // Find which file path exists
    if (typeof filePaths === 'string') {
      actualFilePath = filePaths;
    } else {
      for (const fp of filePaths) {
        if (existsSync(fp)) {
          actualFilePath = fp;
          break;
        }
      }
    }
    
    const pageResult = {
      route,
      filePath: actualFilePath,
      exists: false,
      checks: []
    };

    console.log(`   Checking ${route}...`);

    // Load HTML
    const html = await loadHTML(actualFilePath);
    if (!html) {
      pageResult.checks.push({
        name: 'File exists',
        passed: false,
        message: 'File not found'
      });
      result.passed = false;
      console.log(`      ❌ File not found`);
    } else {
      pageResult.exists = true;

      // Check basic structure
      const structure = hasBasicStructure(html);
      if (structure.hasHeader && structure.hasFooter) {
        pageResult.checks.push({
          name: 'Basic structure',
          passed: true,
          message: 'Has header and footer'
        });
        console.log(`      ✅ Has header and footer`);
      } else {
        pageResult.checks.push({
          name: 'Basic structure',
          passed: false,
          message: `Missing: ${!structure.hasHeader ? 'header' : ''} ${!structure.hasFooter ? 'footer' : ''}`
        });
        result.passed = false;
        console.log(`      ❌ Missing structure elements`);
      }

      // Check required headings
      if (markers.requiredHeadings && markers.requiredHeadings.length > 0) {
        const headings = extractHeadings(html);
        const missingHeadings = [];
        
        for (const required of markers.requiredHeadings) {
          const found = headings.some(h => 
            h.toLowerCase().includes(required.toLowerCase())
          );
          if (!found) {
            missingHeadings.push(required);
          }
        }

        if (missingHeadings.length === 0) {
          pageResult.checks.push({
            name: 'Required headings',
            passed: true,
            message: 'All required headings found'
          });
          console.log(`      ✅ All required headings found`);
        } else {
          pageResult.checks.push({
            name: 'Required headings',
            passed: false,
            message: `Missing: ${missingHeadings.join(', ')}`
          });
          result.passed = false;
          console.log(`      ❌ Missing headings: ${missingHeadings.join(', ')}`);
        }
      }
    }

    result.details.pages.push(pageResult);
  }

  return result;
}

/**
 * Check footer links on home page
 */
async function checkFooterLinks(footerConfig) {
  const result = {
    name: 'Footer Links',
    passed: true,
    details: {}
  };

  const homePath = routeToFilePath('/', OUTPUT_DIR);
  const html = await loadHTML(homePath);

  if (!html) {
    result.passed = false;
    result.details.error = 'Could not load home page';
    console.log('   ❌ Could not load home page');
    return result;
  }

  // Check footer links
  const validation = validateFooterLinks(html, footerConfig.required);
  result.details.validation = validation;

  if (validation.valid) {
    console.log('   ✅ All required footer links found');
  } else {
    result.passed = false;
    console.log(`   ❌ Missing footer links: ${validation.missing.join(', ')}`);
  }

  // Check copyright year
  const yearValid = checkCopyrightYear(html);
  result.details.copyrightYear = yearValid;

  if (yearValid) {
    console.log('   ✅ Copyright year is current');
  } else {
    result.passed = false;
    console.log('   ❌ Copyright year is not current or not found');
  }

  return result;
}

/**
 * Save results to JSON and Markdown
 */
async function saveResults(results) {
  // Ensure reports directory exists
  await mkdir(REPORTS_DIR, { recursive: true });

  // Save JSON report
  await writeFile(REPORT_JSON, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n📄 Detailed report: ${REPORT_JSON}`);

  // Generate and save Markdown summary
  const markdown = generateMarkdownSummary(results);
  await writeFile(REPORT_MD, markdown, 'utf-8');
  console.log(`📄 Summary report: ${REPORT_MD}`);

  // Generate routes-found.json
  const routesFound = results.checks.find(c => c.name === 'Required Routes');
  if (routesFound) {
    const routesJSON = {
      timestamp: results.timestamp,
      found: routesFound.details.found,
      missing: routesFound.details.missing,
      total: routesFound.details.total
    };
    await writeFile(
      join(REPORTS_DIR, 'routes-found.json'),
      JSON.stringify(routesJSON, null, 2),
      'utf-8'
    );
  }
}

/**
 * Generate Markdown summary
 */
function generateMarkdownSummary(results) {
  let md = '# LGFC Site Assessment Summary\n\n';
  md += `**Timestamp:** ${results.timestamp}\n`;
  md += `**Mode:** ${results.mode}\n\n`;
  md += '---\n\n';
  md += `## Summary\n\n`;
  md += `- Total checks: ${results.summary.total}\n`;
  md += `- ✅ Passed: ${results.summary.passed}\n`;
  md += `- ❌ Failed: ${results.summary.failed}\n\n`;
  
  if (results.summary.failed === 0) {
    md += '**✅ ASSESSMENT PASSED** - All checks completed successfully.\n\n';
  } else {
    md += '**❌ ASSESSMENT FAILED** - One or more checks did not pass.\n\n';
  }

  md += '---\n\n';
  md += '## Detailed Results\n\n';

  for (const check of results.checks) {
    md += `### ${check.name}\n\n`;
    md += `**Status:** ${check.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    if (check.details) {
      md += '**Details:**\n\n';
      if (check.name === 'Required Routes') {
        md += `- Total routes: ${check.details.total}\n`;
        md += `- Found: ${check.details.found.length}\n`;
        md += `- Missing: ${check.details.missing.length}\n\n`;
        
        if (check.details.missing.length > 0) {
          md += '**Missing routes:**\n';
          for (const route of check.details.missing) {
            md += `- ${route}\n`;
          }
          md += '\n';
        }
      } else if (check.name === 'Page Markers') {
        for (const page of check.details.pages) {
          md += `\n**${page.route}**\n`;
          for (const c of page.checks) {
            md += `- ${c.passed ? '✅' : '❌'} ${c.name}: ${c.message}\n`;
          }
        }
        md += '\n';
      } else if (check.name === 'Footer Links') {
        if (check.details.validation) {
          md += `- Footer links valid: ${check.details.validation.valid ? 'Yes' : 'No'}\n`;
          if (check.details.validation.missing.length > 0) {
            md += `- Missing: ${check.details.validation.missing.join(', ')}\n`;
          }
        }
        md += `- Copyright year current: ${check.details.copyrightYear ? 'Yes' : 'No'}\n\n`;
      }
    }

    if (check.error) {
      md += `**Error:** ${check.error}\n\n`;
    }

    md += '---\n\n';
  }

  return md;
}

// Run main
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
