/**
 * Site Configuration
 * Central configuration for site identity, navigation, and core settings.
 */

export const siteConfig = {
	name: "Lou Gehrig Fan Club",
	shortName: "LGFC",
	description: "Honoring the legacy of baseball's Iron Horse through community, education, and support for ALS research and awareness.",
	url: "https://www.lougehrigfanclub.com",
	
	// Main navigation links (header)
	nav: [
		{ label: "Weekly", path: "/weekly" },
		{ label: "Milestones", path: "/milestones" },
		{ label: "Charities", path: "/charities" },
		{ label: "News & Q&A", path: "/news" },
		{ label: "Calendar", path: "/calendar" },
	],
	
	// Footer links
	footer: {
		legal: [
			{ label: "Privacy", path: "/privacy" },
			{ label: "Terms", path: "/terms" },
		],
		admin: [
			{ label: "Admin", path: "/admin" },
		],
	},
} as const;

export type SiteConfig = typeof siteConfig;
