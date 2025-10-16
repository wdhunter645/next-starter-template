export async function GET() {
	const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://www.lougehrigfanclub.com/sitemap.xml
`;

	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
