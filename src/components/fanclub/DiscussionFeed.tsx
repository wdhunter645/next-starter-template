type DiscussionFeedProps = {
  refreshTrigger: number;
};

export default function DiscussionFeed({ refreshTrigger }: DiscussionFeedProps) {
  return (
    <section
      aria-label="DiscussionFeed"
      style={{
        padding: 16,
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
      }}
    >
      <h2 style={{ margin: "0 0 8px 0" }}>DiscussionFeed</h2>

      <p style={{ margin: "0 0 12px 0" }}>
        Refresh trigger: <strong>{refreshTrigger}</strong>
      </p>

      <p style={{ margin: 0 }}>Placeholder component. Implement per FanClub design.</p>
    </section>
  );
}
