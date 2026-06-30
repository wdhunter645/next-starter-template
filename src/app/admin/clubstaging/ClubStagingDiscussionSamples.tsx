import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from '@/components/fanclub/clubHomeStyles';
import { CLUB_STAGING_DISCUSSION_SAMPLES } from './clubStagingSamples';

type DiscussionSample = (typeof CLUB_STAGING_DISCUSSION_SAMPLES)[number];

type ClubStagingDiscussionSamplesProps = {
  items: readonly DiscussionSample[];
};

export default function ClubStagingDiscussionSamples({ items }: ClubStagingDiscussionSamplesProps) {
  return (
    <section aria-label="Staged club discussion samples">
      <h2 style={{ ...clubHomeSectionTitle, marginBottom: 12 }}>Discussion card samples</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        {items.map((item) => (
          <article key={item.id} className="card" style={clubHomeSectionCard}>
            <strong>{item.title}</strong>
            <p className="sub" style={{ ...clubHomeMutedText, marginTop: 10 }}>
              {item.body.length > 180 ? `${item.body.slice(0, 180)}…` : item.body}
            </p>
            <div className="sub" style={{ marginTop: 10, opacity: 0.75 }}>
              Posted: {item.created_at}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
