import Link from 'next/link';
import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from './clubHomeStyles';

export default function ClubHomeArchiveSpotlight() {
  return (
    <section aria-label="Archive spotlight" style={clubHomeSectionCard}>
      <h2 style={clubHomeSectionTitle}>Archive Spotlight</h2>
      <p style={{ ...clubHomeMutedText, marginBottom: 12 }}>
        Static fallback: anniversary and tag-driven archive highlights will surface here from approved editorial
        inventory. No dynamic records are loaded on Club Home in Task 003.
      </p>
      <Link href="/fanclub/library" style={{ fontWeight: 600 }}>
        Explore the Gehrig Library
      </Link>
    </section>
  );
}
