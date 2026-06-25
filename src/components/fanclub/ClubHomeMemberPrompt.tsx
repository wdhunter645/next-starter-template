import Link from 'next/link';
import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from './clubHomeStyles';

export default function ClubHomeMemberPrompt() {
  return (
    <section aria-label="Member prompt" style={clubHomeSectionCard}>
      <h2 style={clubHomeSectionTitle}>Join the Conversation</h2>
      <p style={{ ...clubHomeMutedText, marginBottom: 12 }}>
        Share a memory, respond to club discussions, or start a new thread with fellow members.
      </p>
      <Link
        href="/fanclub/chat"
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
        Open Club Discussions
      </Link>
    </section>
  );
}
