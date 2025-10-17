import Script from "next/script";

export default function Page() {
	return (
		<main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
			<h1>Social Wall</h1>
			<p>Club posts from Facebook and Instagram.</p>

			<Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />

			<div
				className="elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8"
				data-elfsight-app-lazy
			/>
		</main>
	);
}
