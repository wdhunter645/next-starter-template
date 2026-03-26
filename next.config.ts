import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* Cloudflare Pages site build; runtime APIs are served by Pages Functions (`functions/api/**`). */
	output: "export",
  trailingSlash: true, // Keep trailing slashes in generated static routes
	images: {
		unoptimized: true, // Required for Cloudflare Pages (no Node.js image optimization)
	},
	// Static assets are exported, while read/write behavior remains on Pages Functions.
};

export default nextConfig;
