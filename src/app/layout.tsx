import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/Layout/SiteHeader";
import SiteFooter from "@/components/Layout/SiteFooter";
import { siteConfig } from "@/lib/site/config";

export const metadata: Metadata = {
	title: siteConfig.siteName,
	description: siteConfig.siteDescription,
	openGraph: {
		title: siteConfig.siteName,
		description: siteConfig.siteDescription,
		url: siteConfig.siteUrl,
		siteName: siteConfig.siteName,
		type: "website",
	},
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="antialiased">
				<SiteHeader />
				<main className="pt-16">
					{children}
				</main>
				<SiteFooter />
			</body>
		</html>
	);
}
