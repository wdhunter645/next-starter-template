/**
 * Site Configuration
 * 
 * Central configuration for site metadata, navigation, and branding.
 * This file is the single source of truth for site-wide constants.
 */

export const siteConfig = {
	// Site metadata
	siteName: "Lou Gehrig Fan Club",
	siteDescription: "Honoring the legacy of baseball's Iron Horse through community, education, and support for ALS research and awareness.",
	siteUrl: "https://www.lougehrigfanclub.com",
	
	// Navigation structure
	navigation: {
		main: [
			{ label: "Weekly", path: "/weekly" },
			{ label: "Milestones", path: "/milestones" },
			{ label: "Charities", path: "/charities" },
			{ label: "News & Q&A", path: "/news" },
			{ label: "Calendar", path: "/calendar" },
		],
		footer: [
			{ label: "Privacy", path: "/privacy" },
			{ label: "Terms", path: "/terms" },
			{ label: "Admin", path: "/admin" },
		],
	},
} as const;
