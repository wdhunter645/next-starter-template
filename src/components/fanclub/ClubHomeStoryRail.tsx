import ClubHomeStaticStory from './ClubHomeStaticStory';

const RAIL_ITEMS = [
  {
    headline: 'Lou Gehrig in the clubhouse',
    summary:
      'Static editorial placeholder. Approved secondary stories will appear here after Task 005 dynamic integration.',
  },
  {
    headline: 'Yankee Stadium memories',
    summary: 'Static editorial placeholder. Supporting archive stories rotate from published content inventory.',
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
