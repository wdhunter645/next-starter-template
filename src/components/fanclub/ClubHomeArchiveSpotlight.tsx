import Link from 'next/link';
import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from './clubHomeStyles';

export default function ClubHomeArchiveSpotlight() {
  return (
    <section aria-label="Archive spotlight" style={clubHomeSectionCard}>
      <h2 style={clubHomeSectionTitle}>Archive Spotlight</h2>
      <p style={{ ...clubHomeMutedText, marginBottom: 12 }}>
        Anniversary and tag-driven highlights from the Gehrig archive will appear here. Browse the library for current
        stories.
      </p>
      <Link href="/fanclub/library" style={{ fontWeight: 600 }}>
        Explore the Gehrig Library
      </Link>
    </section>
  );
}
