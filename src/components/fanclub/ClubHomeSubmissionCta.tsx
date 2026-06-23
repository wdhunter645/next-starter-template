import Link from 'next/link';
import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from './clubHomeStyles';

export default function ClubHomeSubmissionCta() {
  return (
    <section aria-label="Submission call to action" style={clubHomeSectionCard}>
      <h2 style={clubHomeSectionTitle}>Share With the Club</h2>
      <p style={{ ...clubHomeMutedText, marginBottom: 12 }}>
        Submit a story, memory, or archive note for editorial review. Photo and media upload workflows remain scoped to
        later content-operation tasks.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          href="/fanclub/submit"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid rgba(0,0,0,0.18)',
            borderRadius: 10,
            padding: '8px 12px',
            fontWeight: 600,
          }}
        >
          Submit a story or note
        </Link>
        <Link href="/fanclub/photo" style={{ fontWeight: 600 }}>
          Visit the Gallery
        </Link>
      </div>
    </section>
  );
}
