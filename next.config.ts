import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* Production static export configuration for Cloudflare Pages */
	output: "export",
  trailingSlash: true, // Keep trailing slashes in generated static routes
	images: {
		unoptimized: true, // Required for Cloudflare Pages (no Node.js image optimization)
	},
	// trailingSlash stays enabled to preserve production route behavior
};

export default nextConfig;
