import ClubHomeStaticStory from './ClubHomeStaticStory';

const RAIL_ITEMS = [
  {
    headline: 'Lou Gehrig in the clubhouse',
    summary:
      'More clubhouse stories from the archive will appear here as new Club Home features roll out.',
  },
  {
    headline: 'Yankee Stadium memories',
    summary: 'Supporting stories from the Gehrig library will rotate through this section.',
  },
] as const;

export default function ClubHomeStoryRail() {
  return (
    <section aria-label="Secondary story rail">
      <h2 style={{ margin: '0 0 12px 0', fontSize: 22, color: 'var(--lgfc-blue, #003366)' }}>More Stories</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {RAIL_ITEMS.map((item) => (
          <ClubHomeStaticStory
            key={item.headline}
            ariaLabel={`Secondary story: ${item.headline}`}
            title="Story"
            headline={item.headline}
            summary={item.summary}
            compact
          />
        ))}
      </div>
    </section>
  );
}
