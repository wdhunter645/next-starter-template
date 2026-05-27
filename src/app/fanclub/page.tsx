'use client';

import Link from 'next/link';
import FloatingLogo from '@/components/FloatingLogo';
import AdminLink from '@/components/fanclub/AdminLink';
import { useMemberSession } from '@/hooks/useMemberSession';

type NavCard = {
  href: string;
  title: string;
  description: string;
};

const FANCLUB_NAV: NavCard[] = [
  {
    href: '/fanclub/myprofile',
    title: 'My Profile',
    description: 'View and manage your member profile details.',
  },
  {
    href: '/fanclub/library',
    title: 'Library',
    description: 'Browse fan club library entries and references.',
  },
  {
    href: '/fanclub/memorabilia',
    title: 'Memorabilia',
    description: 'Explore memorabilia highlights curated for members.',
  },
  {
    href: '/fanclub/photo',
    title: 'Member Photos',
    description: 'See member photo uploads and visual highlights.',
  },
  {
    href: '/fanclub/submit',
    title: 'Submit Content',
    description: 'Send new content for fan club review and publishing.',
  },
  {
    href: '/fanclub/chat',
    title: 'Member Chat',
    description: 'Join member discussion threads and ongoing conversation.',
  },
];

export default function MemberHomePage() {
  const { isLoading, isAuthenticated, email, role } = useMemberSession({ redirectTo: '/' });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main>
      <FloatingLogo />
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          textAlign: 'center',
          margin: '40px 20px 32px 20px',
          color: 'var(--lgfc-blue)',
        }}
      >
        WELCOME LOU GEHRIG FAN CLUB MEMBERS
      </h1>

      <section
        aria-label="FanClubMemberShell"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 20px',
        }}
      >
        <p style={{ margin: '0 0 20px 0', color: 'rgba(0,0,0,0.72)', lineHeight: 1.55 }}>
          Signed in as <strong>{email || 'member'}</strong>. Use the member areas below to navigate the
          Fan Club experience.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {FANCLUB_NAV.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 12,
                padding: 14,
                background: '#fff',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700 }}>{card.title}</div>
              <p style={{ margin: '8px 0 0 0', fontSize: 14, color: 'rgba(0,0,0,0.7)', lineHeight: 1.45 }}>
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <AdminLink isAdmin={role === 'admin'} />
    </main>
  );
}
