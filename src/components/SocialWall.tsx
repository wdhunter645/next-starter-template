import Script from 'next/script';

export default function SocialWall() {
  return (
    <>
      <div
        className="elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8"
        data-elfsight-app-lazy
      />
      <Script
        src="https://elfsightcdn.com/platform.js"
        strategy="afterInteractive"
      />
    </>
  );
}
