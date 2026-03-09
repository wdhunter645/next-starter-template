import Link from 'next/link';

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
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 12,
        marginTop: 16,
      }}
    >
      <h2 style={{ margin: '0 0 8px 0' }}>Admin</h2>
      <p style={{ margin: '0 0 12px 0' }}>Admin access detected.</p>
      <Link
        href="/admin"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid rgba(0,0,0,0.2)',
          textDecoration: 'none',
          color: 'inherit',
          fontWeight: 700,
        }}
      >
        Open Admin Dashboard
      </Link>
    </section>
  );
}
