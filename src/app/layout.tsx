import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
	title: "Next.js Starter Template",
	description: "A modern Next.js 15 starter template with TypeScript, Tailwind CSS 4, React 19, and Cloudflare Pages deployment",
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
