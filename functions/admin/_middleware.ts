// Cloudflare Pages Functions middleware for /admin routes
// Enforces admin access control using ADMIN_TOKEN

import { requireAdmin } from "../_lib/auth";

export const onRequest: PagesFunction = async (context) => {
  const { request, env, next } = context;

  // For HTML page requests to /admin, check authentication
  const deny = requireAdmin(request, env);
  
  if (deny) {
    // Return a simple HTML page with error message instead of JSON
    // This provides better UX for browser navigation
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Access Required</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 500px;
      text-align: center;
    }
    h1 {
      color: #d32f2f;
      margin-top: 0;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
    .code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }
    a {
      color: #1976d2;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⛔ Admin Access Required</h1>
    <p>You need admin credentials to access this page.</p>
    <p>Admin access is protected by the <span class="code">x-admin-token</span> header.</p>
    <p>Please ensure you have configured the admin token in your browser.</p>
    <p style="margin-top: 30px;">
      <a href="/">← Return to Home</a>
    </p>
  </div>
</body>
</html>`,
      {
        status: 401,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  // If authorized, continue to next handler (serve static page)
  return next();
};
