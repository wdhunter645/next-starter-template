export const onRequest: PagesFunction = async (context) => {
  const req = context.request;
  const url = new URL(req.url);
  const path = url.pathname;

  // 1) Never intercept Next assets or obvious static files
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/images/") ||
    path.startsWith("/cdn-cgi/") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(path) // has a file extension
  ) {
    return fetch(req);
  }

  // Helper: try a candidate URL and return it if it exists (200/304)
  const tryFetch = async (candidatePath: string) => {
    const u = new URL(req.url);
    u.pathname = candidatePath;
    // keep querystring
    const r = await fetch(new Request(u.toString(), req));
    if (r.status === 200 || r.status === 304) return r;
    return null;
  };

  // 2) If user requests /about/ -> try /about/index.html
  if (path.endsWith("/")) {
    const r1 = await tryFetch(path + "index.html");
    if (r1) return r1;

    // fallback for older flat exports: /about/ -> /about.html
    const flat = path.replace(/\/$/, "") + ".html";
    const r2 = await tryFetch(flat);
    if (r2) return r2;

    return fetch(req);
  }

  // 3) If user requests /about (no slash, no extension):
  // prefer redirect to slash, then serve index.html behind it
  const rSlash = await tryFetch(path + "/index.html");
  if (rSlash) {
    return Response.redirect(url.origin + path + "/", 308);
  }

  // fallback: serve /about.html directly if it exists
  const rFlat = await tryFetch(path + ".html");
  if (rFlat) {
    return Response.redirect(url.origin + path + ".html", 308);
  }

  return fetch(req);
};
