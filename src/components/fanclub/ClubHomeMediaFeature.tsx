import Link from 'next/link';
import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from './clubHomeStyles';

export default function ClubHomeMediaFeature() {
  return (
    <section aria-label="Photo and memorabilia feature" style={clubHomeSectionCard}>
      <h2 style={clubHomeSectionTitle}>Featured Photo &amp; Memorabilia</h2>
      <p style={{ ...clubHomeMutedText, marginBottom: 12 }}>
        Static fallback: a rotating approved photo or memorabilia highlight will appear here when dynamic media is
        available. Browse the archives below in the meantime.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link href="/fanclub/photo" style={{ fontWeight: 600 }}>
          Gallery
        </Link>
        <Link href="/fanclub/memorabilia" style={{ fontWeight: 600 }}>
          Memorabilia
        </Link>
      </div>
    </section>
  );
}
