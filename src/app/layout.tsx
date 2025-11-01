import type { Metadata } from "next";
import "./globals.css";
import "./../styles/variables.css";
import Header from "../components/Header";
import JoinCTA from "@/components/JoinCTA";
import SocialWall from "@/components/SocialWall";
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
			<body className="antialiased">
				{/* Top fixed header (notice text via env) */}
				<Header noticeText={process.env.NEXT_PUBLIC_NOTICE_TEXT ?? undefined} />
				{children}
				<JoinCTA />
				<SocialWall />
				<Footer />
			</body>
		</html>
	);
}
