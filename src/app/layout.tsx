import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
	title: "LGFC - Your Trusted Partner",
	description: "LGFC provides exceptional services tailored to your needs",
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
