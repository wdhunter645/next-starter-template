import type { ReactNode } from 'react';
import { buildPublicPageMetadata } from '@/lib/publicSiteMetadata';

export const metadata = buildPublicPageMetadata({
  title: 'Ask a Question',
  description: 'Submit a question for moderator review on the Lou Gehrig Fan Club website.',
  path: '/ask/',
});

export default function AskLayout({ children }: { children: ReactNode }) {
  return children;
}
