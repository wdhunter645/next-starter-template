import type { ReactNode } from 'react';
import { buildPublicPageMetadata } from '@/lib/publicSiteMetadata';

export const metadata = buildPublicPageMetadata({
  title: 'Events',
  description: 'Upcoming Lou Gehrig Fan Club events and calendar preview.',
  path: '/events/',
});

export default function EventsLayout({ children }: { children: ReactNode }) {
  return children;
}
