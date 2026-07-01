import type { ReactNode } from 'react';
import { buildPublicPageMetadata } from '@/lib/publicSiteMetadata';

export const metadata = buildPublicPageMetadata({
  title: 'Contact',
  description: 'Contact the Lou Gehrig Fan Club support and admin teams.',
  path: '/contact/',
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
