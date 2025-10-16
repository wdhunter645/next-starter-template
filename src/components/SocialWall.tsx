"use client";

import { useEffect } from "react";

interface SocialWallProps {
	widgetId?: string;
}

export default function SocialWall({ widgetId = "YOUR_ELFSIGHT_WIDGET_ID" }: SocialWallProps) {
	useEffect(() => {
		// Load Elfsight platform script
		const script = document.createElement("script");
		script.src = "https://static.elfsight.com/platform/platform.js";
		script.async = true;
		script.setAttribute("data-use-service-core", "");
		script.defer = true;
		
		document.body.appendChild(script);

		return () => {
			// Cleanup script on unmount
			if (document.body.contains(script)) {
				document.body.removeChild(script);
			}
		};
	}, []);

	return (
		<div className="elfsight-app-container" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
			<div className={`elfsight-app-${widgetId}`} data-elfsight-app-lazy></div>
		</div>
	);
}
