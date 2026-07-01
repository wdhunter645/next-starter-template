import type { ReactNode } from 'react';
import { buildPublicPageMetadata } from '@/lib/publicSiteMetadata';

export const metadata = buildPublicPageMetadata({
  title: 'Search',
  description: 'Search approved FAQs, events, milestones, and public Lou Gehrig Fan Club content.',
  path: '/search/',
});

export default function SearchLayout({ children }: { children: ReactNode }) {
  return children;
}
