import type { ReactNode } from 'react';
import { buildPublicPageMetadata } from '@/lib/publicSiteMetadata';

export const metadata = buildPublicPageMetadata({
  title: 'FAQ',
  description: 'Approved public FAQ entries for the Lou Gehrig Fan Club.',
  path: '/faq/',
});

export default function FaqLayout({ children }: { children: ReactNode }) {
  return children;
}
