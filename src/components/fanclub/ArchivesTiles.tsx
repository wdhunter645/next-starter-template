import Link from 'next/link';

const ARCHIVE_LINKS = [
  {
    href: '/fanclub/photo',
    title: 'Member Photos',
    description: 'Browse member photo uploads and visual highlights.',
  },
  {
    href: '/fanclub/memorabilia',
    title: 'Memorabilia',
    description: 'Explore memorabilia entries curated for members.',
  },
  {
    href: '/fanclub/library',
    title: 'Library',
    description: 'Read fan club library references and stories.',
  },
] as const;

export default function ArchivesTiles() {
  return (
    <section aria-label="Archives tiles">
      <h2 style={{ margin: '0 0 12px 0', fontSize: 22 }}>Club Archives</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {ARCHIVE_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 12,
              padding: 14,
              background: '#fff',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700 }}>{item.title}</div>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.7)', lineHeight: 1.45 }}>
              {item.description}
            </p>
          </Link>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          padding: 14,
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 12,
          background: '#fff',
        }}
      >
        <strong>Have something to share?</strong>
        <p style={{ margin: '8px 0 12px', fontSize: 14, color: 'rgba(0,0,0,0.7)', lineHeight: 1.45 }}>
          Send a member article, memory, or archive note through the approved submission path.
        </p>
        <Link
          href="/fanclub/submit"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid rgba(0,0,0,0.18)',
            borderRadius: 10,
            padding: '8px 12px',
          }}
        >
          Submit to the Library
        </Link>
      </div>
    </section>
  );
}
