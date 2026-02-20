type PostCreationProps = {
  email: string;
  onPostCreated: () => void;
};

export default function PostCreation({ email, onPostCreated }: PostCreationProps) {
  return (
    <section
      aria-label="PostCreation"
      style={{
        padding: 16,
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
      }}
    >
      <h2 style={{ margin: "0 0 8px 0" }}>PostCreation</h2>

      <p style={{ margin: "0 0 12px 0" }}>
        Signed in as <strong>{email}</strong>
      </p>

      <button
        type="button"
        onClick={onPostCreated}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.2)",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        Refresh Feed
      </button>

      <p style={{ margin: "12px 0 0 0" }}>
        Placeholder component. Implement per FanClub design.
      </p>
    </section>
  );
}
