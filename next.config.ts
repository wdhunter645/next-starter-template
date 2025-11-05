import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* Cloudflare Pages configuration */
	images: {
		unoptimized: true, // Required for Cloudflare Pages (no Node.js image optimization)
	},
	// Skip trailing slash to match Cloudflare Pages defaults
	// No output: "standalone" - not needed for Cloudflare Pages
};

export default nextConfig;
