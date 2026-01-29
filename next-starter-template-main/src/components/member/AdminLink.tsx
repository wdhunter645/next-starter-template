type AdminLinkProps = {
  isAdmin: boolean;
};

export default function AdminLink({ isAdmin }: AdminLinkProps) {
  if (!isAdmin) {
    return null;
  }

  return (
    <section style={{
      padding: '32px 20px',
      maxWidth: 900,
      margin: '0 auto',
      borderTop: '1px solid rgba(0,0,0,0.1)',
    }}>
      <h2 style={{
        fontSize: 20,
        margin: '0 0 12px 0',
        fontWeight: 700,
      }}>
        Admin Tools
      </h2>

      <p style={{
        fontSize: 14,
        color: 'rgba(0,0,0,0.7)',
        margin: '0 0 16px 0',
      }}>
        You have administrator access. Use the dashboard to manage content, moderate discussions, and configure site settings.
      </p>

      <a
        href="/admin"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 700,
          color: '#fff',
          background: 'var(--lgfc-blue)',
          border: 'none',
          borderRadius: 8,
          textDecoration: 'none',
        }}
      >
        Go to Admin Dashboard →
      </a>
    </section>
  );
}
