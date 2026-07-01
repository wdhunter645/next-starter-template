import type { ReactNode } from 'react';
import { buildPublicPageMetadata } from '@/lib/publicSiteMetadata';

export const metadata = buildPublicPageMetadata({
  title: 'About',
  description: 'Learn about the Lou Gehrig Fan Club mission, public preview content, and member community boundaries.',
  path: '/about/',
});

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
