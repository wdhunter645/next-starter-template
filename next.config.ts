import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* Cloudflare Pages configuration */
	output: "export", // Generate static export for Cloudflare Pages
	images: {
		unoptimized: true, // Required for Cloudflare Pages (no Node.js image optimization)
	},
	trailingSlash: true, // Export /route/index.html for Pages
	// (Pages does not reliably map /route to /route.html)
};

export default nextConfig;
