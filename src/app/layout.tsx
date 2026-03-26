import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./../styles/variables.css";
import SiteHeader from "../components/SiteHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
	title: "Lou Gehrig Fan Club",
	description: "Official Lou Gehrig Fan Club website with fan stories, historical archives, events, and member access.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="antialiased">
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
