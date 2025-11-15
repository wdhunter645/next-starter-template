'use client';
import Script from 'next/script';

export default function SocialWall() {
  return (
    <div className="social-wall-embed">
      <div
        className="elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8"
        data-elfsight-app-lazy
      />
      <p className="social-wall-fallback" style={{ marginTop: '1rem', color: '#666' }}>
        Loading social wall content...
      </p>
      <Script
        src="https://elfsightcdn.com/platform.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
