/**
 * HTML validation helper functions for LGFC assessment harness
 */

import { readFile } from 'fs/promises';

/**
 * Load and parse HTML file content
 */
export async function loadHTML(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    return null;
  }
}

/**
 * Check if HTML contains required text/markers
 */
export function containsText(html, text) {
  if (!html) return false;
  return html.includes(text);
}

/**
 * Check if HTML contains any forbidden text/markers
 */
export function containsForbiddenText(html, forbiddenTexts) {
  if (!html) return [];
  const found = [];
  for (const text of forbiddenTexts) {
    if (html.includes(text)) {
      found.push(text);
    }
  }
  return found;
}

/**
 * Extract all heading text from HTML (simple regex-based)
 */
export function extractHeadings(html) {
  if (!html) return [];
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const matches = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    // Strip HTML tags from heading content
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text) matches.push(text);
  }
  return matches;
}

/**
 * Check if HTML has basic structure (header, footer)
 */
export function hasBasicStructure(html) {
  if (!html) return { hasHeader: false, hasFooter: false };
  return {
    hasHeader: /<header/i.test(html) || /<nav/i.test(html),
    hasFooter: /<footer/i.test(html)
  };
}

/**
 * Extract links from HTML (href attributes)
 */
export function extractLinks(html) {
  if (!html) return [];
  const linkRegex = /href=["']([^"']+)["']/gi;
  const links = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return links;
}

/**
 * Check if route exists in output directory
 * Tries both directory/index.html and file.html patterns
 */
export function routeToFilePath(route, outputDir = 'out') {
  // Normalize route
  if (route === '/') {
    return `${outputDir}/index.html`;
  }
  // Remove leading slash and add /index.html
  const normalized = route.replace(/^\//, '').replace(/\/$/, '');
  
  // Try both patterns: directory/index.html and file.html
  const directoryPattern = `${outputDir}/${normalized}/index.html`;
  const filePattern = `${outputDir}/${normalized}.html`;
  
  // Return an array of possible paths to try
  return [directoryPattern, filePattern];
}

/**
 * Validate footer links in HTML
 */
export function validateFooterLinks(html, requiredLinks) {
  if (!html) return { valid: false, missing: requiredLinks };
  
  const links = extractLinks(html);
  const missing = [];
  
  for (const required of requiredLinks) {
    if (required.type === 'mailto') {
      // Check for mailto links
      const hasMailto = html.includes('mailto:');
      if (!hasMailto) {
        missing.push(required.label);
      }
    } else if (required.target) {
      // Check for specific target
      if (!links.includes(required.target)) {
        missing.push(required.label);
      }
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Check copyright year is current
 */
export function checkCopyrightYear(html) {
  if (!html) return false;
  const currentYear = new Date().getFullYear();
  const copyrightRegex = /©.*?(\d{4})/;
  const match = html.match(copyrightRegex);
  
  if (!match) return false;
  return parseInt(match[1]) === currentYear;
}

/**
 * Simple text normalization for comparison
 */
export function normalizeText(text) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}
