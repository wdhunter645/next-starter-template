import Link from 'next/link';

type WelcomeSectionProps = {
  email?: string | null;
};

export default function WelcomeSection({ email }: WelcomeSectionProps) {
  const memberName = typeof email === 'string' && email.includes('@') ? email.split('@')[0] : 'member';

  return (
    <section
      aria-label="Welcome section"
      style={{
        padding: 18,
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.72)',
      }}
    >
      <h2 style={{ margin: '0 0 10px 0', fontSize: 24 }}>Welcome back, {memberName}.</h2>
      <p style={{ margin: '0 0 12px 0', lineHeight: 1.6 }}>
        This is the FanClub home area for members. Use the quick links below to browse the archive,
        update your profile, and participate in member discussion.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Link
          href="/fanclub/myprofile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.18)',
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
          }}
        >
          Open My Profile
        </Link>
        <Link
          href="/fanclub/photo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.18)',
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
          }}
        >
          Browse Photo Gallery
        </Link>
      </div>
    </section>
  );
}
