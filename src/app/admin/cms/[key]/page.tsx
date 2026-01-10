// Server component wrapper for dynamic admin CMS editor route
// Satisfies static export requirements while allowing client-side dynamic routing

import Editor from './editor';

// Generate static params - provide dummy param for static export
// Real routing handled client-side via Cloudflare Pages Functions
export function generateStaticParams() {
  return [{ key: '_' }];
}

export default function AdminCMSEditorPage() {
  return <Editor />;
}
