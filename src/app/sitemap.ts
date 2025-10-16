import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lougehrigfanclub.com";
	const currentDate = new Date();

	return [
		{
			url: baseUrl,
			lastModified: currentDate,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${baseUrl}/weekly`,
			lastModified: currentDate,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/milestones`,
			lastModified: currentDate,
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/charities`,
			lastModified: currentDate,
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/news`,
			lastModified: currentDate,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/calendar`,
			lastModified: currentDate,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/member`,
			lastModified: currentDate,
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${baseUrl}/privacy`,
			lastModified: currentDate,
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${baseUrl}/terms`,
			lastModified: currentDate,
			changeFrequency: "yearly",
			priority: 0.3,
		},
	];
}
