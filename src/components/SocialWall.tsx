"use client";

import { useEffect, useState } from "react";
import styles from "./SocialWall.module.css";

export default function SocialWall() {
	const [scriptLoaded, setScriptLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		// Check if script is already loaded
		if (document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
			setScriptLoaded(true);
			return;
		}

		// Create and load the Elfsight script
		const script = document.createElement("script");
		script.src = "https://static.elfsight.com/platform/platform.js";
		script.async = true;
		script.setAttribute("data-use-service-core", "");
		script.defer = true;

		script.onload = () => {
			setScriptLoaded(true);
		};

		script.onerror = () => {
			setHasError(true);
		};

		document.body.appendChild(script);

		return () => {
			// Cleanup if needed
			if (script.parentNode) {
				script.parentNode.removeChild(script);
			}
		};
	}, []);

	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<h2 className={styles.heading}>From the Community</h2>
				<div className={styles.feedContainer}>
					{hasError ? (
						<p className={styles.fallback}>
							Follow us on social media for updates and photos of Lou Gehrig&apos;s legacy.
						</p>
					) : (
						<>
							<div
								className="elfsight-app-ef0af9bb-7f80-416f-a68b-d78b9f9c5697"
								data-elfsight-app-lazy
							></div>
							{!scriptLoaded && (
								<p className={styles.loading}>Loading social feed...</p>
							)}
						</>
					)}
				</div>
			</div>
		</section>
	);
}
