export async function GET() {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lougehrigfanclub.com";
	const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${siteUrl}/sitemap.xml
`;

	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
