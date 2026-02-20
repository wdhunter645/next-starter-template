type AdminLinkProps = {
  isAdmin: boolean;
};

export default function AdminLink({ isAdmin }: AdminLinkProps) {
  if (!isAdmin) return null;

  return (
    <section
      aria-label="AdminLink"
      style={{
        padding: 16,
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
        marginTop: 16,
      }}
    >
      <h2 style={{ margin: "0 0 8px 0" }}>Admin</h2>
      <p style={{ margin: 0 }}>Admin access detected. Implement Admin link per design.</p>
    </section>
  );
}
