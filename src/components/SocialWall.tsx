'use client';
import { useEffect } from 'react';

export default function SocialWall() {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://elfsightcdn.com/platform.js"]'
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      className="elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8"
      data-elfsight-app-lazy
      role="region"
      aria-label="Social media feed"
    />
  );
}
