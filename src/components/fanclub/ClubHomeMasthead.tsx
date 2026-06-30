import Link from 'next/link';
import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from './clubHomeStyles';

type ClubHomeMastheadProps = {
  email?: string | null;
};

export default function ClubHomeMasthead({ email }: ClubHomeMastheadProps) {
  const emailHint = typeof email === 'string' && email.includes('@') ? email.split('@')[0] : '';

  return (
    <header aria-label="Club Home masthead" style={clubHomeSectionCard}>
      <p
        style={{
          margin: '0 0 8px 0',
          fontSize: 13,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'rgba(0,0,0,0.55)',
        }}
      >
        Lou Gehrig Fan Club
      </p>
      <h1 style={{ ...clubHomeSectionTitle, fontSize: 30, marginBottom: 10 }}>Club Home</h1>
      <p style={{ ...clubHomeMutedText, marginBottom: 10 }}>
        Welcome back{emailHint ? `, ${emailHint}` : ''}. Your member home for Lou Gehrig stories, archives, and club activity as the Fan Club
        prepares for the 2027 public relaunch.
      </p>
      <Link href="/fanclub/myprofile" style={{ fontWeight: 600 }}>
        My Profile
      </Link>
    </header>
  );
}
