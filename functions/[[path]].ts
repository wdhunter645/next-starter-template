export const onRequest = async (context: any) => {
  const req = context.request;
  const url = new URL(req.url);
  const path = url.pathname;

  const passThrough = () => {
    // Cloudflare Pages Functions: this hands off to the static asset layer.
    if (context && typeof context.next === "function") return context.next();
    // Fallback (shouldn't happen on Pages)
    return fetch(req);
  };

  // Never intercept Next assets or obvious static files
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/images/") ||
    path.startsWith("/cdn-cgi/") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(path) // has a file extension
  ) {
    return passThrough();
  }

  // Prefer Pages static asset binding when present (avoids looping back through Functions)
  const assetsFetch =
    context?.env?.ASSETS?.fetch ||
    context?.env?.__STATIC_CONTENT?.fetch ||
    null;

  const tryFetch = async (candidatePath: string) => {
    const u = new URL(req.url);
    u.pathname = candidatePath;

    let r: Response;
    try {
      if (assetsFetch) {
        r = await assetsFetch(u.toString());
      } else {
        // Fallback: may work, but assetsFetch is the correct path on Pages.
        r = await fetch(u.toString(), req as any);
      }
    } catch {
      return null;
    }

    if (r.status === 200 || r.status === 304) return r;
    return null;
  };

  // If user requests /about/ -> try /about/index.html
  if (path.endsWith("/")) {
    const r1 = await tryFetch(path + "index.html");
    if (r1) return r1;

    // Optional fallback (legacy export style)
    const r2 = await tryFetch(path.slice(0, -1) + ".html");
    if (r2) return r2;

    return passThrough();
  }

  // If user requests /about -> try /about/ (308) and then /about/index.html
  const r3 = await tryFetch(path + "/index.html");
  if (r3) {
    return Response.redirect(url.origin + path + "/", 308);
  }

  // Optional legacy fallback: /about.html
  const r4 = await tryFetch(path + ".html");
  if (r4) return r4;

  return passThrough();
};
