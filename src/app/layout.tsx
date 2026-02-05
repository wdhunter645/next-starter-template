import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./../styles/variables.css";
import TopNoticeBar from "../components/TopNoticeBar";
import SiteHeader from "../components/SiteHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
	title: "LGFC",
	description: "Lou Gehrig Fan Club",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<Script
				src="https://elfsightcdn.com/platform.js"
				strategy="beforeInteractive"
				data-use-service-core="true"
			/>
			<body className="antialiased">
				<TopNoticeBar />
				{/* Header: visitor vs member */}
				<SiteHeader />
				{/* Offset for sticky controls */}
				<div className="topWhitespace" />
				{children}
				<Footer />
			</body>
		</html>
	);
}
