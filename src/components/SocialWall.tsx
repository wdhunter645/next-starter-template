'use client';
import Script from 'next/script';

export default function SocialWall() {
  return (
    <>
      <Script
        src="https://static.elfsight.com/platform/platform.js"
        strategy="lazyOnload"
      />
      <div className="elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8" />
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Loading social wall content...
      </p>
    </>
  );
}
