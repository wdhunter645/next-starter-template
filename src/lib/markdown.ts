/**
 * markdown.ts
 * 
 * Markdown rendering utilities with sanitization
 * Compatible with Cloudflare Workers/Pages (uses isomorphic-dompurify)
 */

import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

// Configure marked once at module initialization
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
});

/**
 * Render markdown to safe HTML
 * Sanitizes output to prevent XSS attacks
 * 
 * @param markdown - Markdown string to render
 * @returns Sanitized HTML string
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // Render markdown to HTML
  const rawHtml = marked(markdown) as string;
  
  // Sanitize HTML to prevent XSS
  // Allow common safe tags but strip scripts, iframes, etc.
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'del', 'ins'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });
  
  return cleanHtml;
}

/**
 * Render markdown preview for admin use
 * More lenient sanitization for preview purposes
 * 
 * @param markdown - Markdown string to render
 * @returns Sanitized HTML string
 */
export function renderMarkdownPreview(markdown: string): string {
  if (!markdown) return '';
  
  const rawHtml = marked(markdown) as string;
  
  // Less restrictive for admin preview, but still sanitize
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick']
  });
  
  return cleanHtml;
}
