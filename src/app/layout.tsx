import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
	title: "Lou Gehrig Fan Club",
	description: "Honoring the legacy of baseball's Iron Horse through community, education, and support for ALS research and awareness.",
	openGraph: {
		title: "Lou Gehrig Fan Club",
		description: "Honoring the legacy of baseball's Iron Horse through community, education, and support for ALS research and awareness.",
		url: "https://www.lougehrigfanclub.com",
		siteName: "Lou Gehrig Fan Club",
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
