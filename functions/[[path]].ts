export const onRequest: PagesFunction = async (ctx) => ctx.next();
/**
 * Ensure built-ins like node:buffer resolve cleanly on Cloudflare Workers.
 * (Silences the WRANGLER warning and avoids edge flakiness.)
 */
export const config = {
  compatibility_flags: ["nodejs_compat"]
};
