import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Environment variables with safe fallbacks
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Lou Gehrig Fan Club";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lougehrigfanclub.com";

export const metadata: Metadata = {
	title: SITE_NAME,
	description: "Honoring the legacy of baseball's Iron Horse through community, education, and support for ALS research and awareness.",
	openGraph: {
		title: SITE_NAME,
		description: "Honoring the legacy of baseball's Iron Horse through community, education, and support for ALS research and awareness.",
		url: SITE_URL,
		siteName: SITE_NAME,
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
				<Header />
				<main className="pt-16">
					{children}
				</main>
				<Footer />
			</body>
		</html>
	);
}
