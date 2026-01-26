// Cloudflare Pages Functions middleware for rate limiting
// Applies Cloudflare native rate limiting to sensitive API routes only
// Only enforces on write methods: POST, PUT, PATCH, DELETE

interface PagesContext {
  request: Request;
  env: any;
  params: any;
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  data: any;
}

// Sensitive API routes that require rate limiting (write operations only)
const RATE_LIMITED_ROUTES = [
  '/api/join',
  '/api/login',
  '/api/support',
  '/api/matchup/vote',
  '/api/faq/submit',
  '/api/admin/',  // All admin routes
  '/api/member/', // All member routes
  '/api/cms/',
  '/api/content/'
];

// Write methods that should be rate limited
const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Check if a request path matches any rate-limited route
 */
function isRateLimitedRoute(pathname: string): boolean {
  return RATE_LIMITED_ROUTES.some(route => {
    if (route.endsWith('/')) {
      return pathname.startsWith(route);
    }
    return pathname === route;
  });
}

/**
 * Middleware: Apply Cloudflare native rate limiting to sensitive routes
 * Only applies to write methods (POST, PUT, PATCH, DELETE)
 */
export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  
  // Only rate limit write methods
  if (!WRITE_METHODS.includes(method)) {
    return next();
  }
  
  // Only rate limit sensitive routes
  if (!isRateLimitedRoute(url.pathname)) {
    return next();
  }
  
  // Check if rate limiting binding is available
  if (!env.RATE_LIMIT) {
    // Rate limiting not configured - log warning but allow request
    console.warn('RATE_LIMIT binding not configured, skipping rate limiting');
    return next();
  }
  
  try {
    // Apply Cloudflare native rate limiting
    // Using the RATE_LIMIT binding configured in wrangler.toml
    const clientIp = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For');
    
    if (!clientIp) {
      // No IP available - fail request for security
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Unable to identify client',
          detail: 'Request missing required IP headers'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Create rate limit key based on IP and route pattern (not full path)
    // Normalize route patterns to reduce cache entries
    let routePattern = url.pathname;
    if (routePattern.startsWith('/api/admin/')) {
      routePattern = '/api/admin/*';
    } else if (routePattern.startsWith('/api/member/')) {
      routePattern = '/api/member/*';
    } else if (routePattern.startsWith('/api/cms/')) {
      routePattern = '/api/cms/*';
    } else if (routePattern.startsWith('/api/content/')) {
      routePattern = '/api/content/*';
    }
    
    const rateLimitKey = `${clientIp}:${routePattern}`;
    
    // Check rate limit using Cloudflare's Rate Limiting API
    const { success } = await env.RATE_LIMIT.limit({ key: rateLimitKey });
    
    if (!success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Rate limit exceeded',
          detail: 'Too many requests. Please wait a moment and try again.'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      );
    }
  } catch (error: any) {
    // Log error but don't block request if rate limiting fails
    console.error('Rate limiting error:', error?.message || 'Unknown error');
  }
  
  // Continue to next middleware or handler
  return next();
}
