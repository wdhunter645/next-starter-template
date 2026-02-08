import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* Cloudflare Pages configuration */
	output: "export",
  trailingSlash: true, // Generate static export for Cloudflare Pages
	images: {
		unoptimized: true, // Required for Cloudflare Pages (no Node.js image optimization)
	},
	// Skip trailing slash to match Cloudflare Pages defaults
};

export default nextConfig;
