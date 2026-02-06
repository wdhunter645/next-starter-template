// functions/_middleware.ts
// ZIP 5: Content Security Policy (CSP)
//
// Rollout strategy:
// - Start in REPORT-ONLY mode to avoid breaking third-party resources during stabilization.
// - Capture violations via POST /api/csp-report.
// - Once staging is clean, switch the header name to `Content-Security-Policy` (enforced).

function buildCsp(): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://*.elfsight.com https://elfsightcdn.com https://cdn.elfsight.com https://files.elfsightcdn.com https://scontent.cdninstagram.com https://scontent-*.cdninstagram.com https://platform-lookaside.fbsbx.com",
    "script-src 'self' https://static.elfsight.com https://elfsightcdn.com",
    "style-src 'self' 'unsafe-inline' https://elfsightcdn.com",
    "connect-src 'self' https://*.elfsight.com",
    "frame-src https://*.elfsight.com",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
  ];
  return directives.join("; ");
}

export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
}): Promise<Response> {
  const response = await context.next();

  // REPORT-ONLY during rollout.
  response.headers.set("Content-Security-Policy-Report-Only", buildCsp());

  // Minimal, safe security headers (kept tight to ZIP #5 scope).
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}
