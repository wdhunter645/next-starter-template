import Link from 'next/link';

export default function ArchivesTiles() {
  const tiles = [
    { href: '/fanclub/photo', title: 'Photo Gallery', desc: 'Browse member-submitted photos of Lou Gehrig.' },
    { href: '/fanclub/library', title: 'Library', desc: 'Read articles, essays, and historical material.' },
    { href: '/fanclub/memorabilia', title: 'Memorabilia', desc: 'Explore cards, equipment, and collectibles.' },
  ];

  return (
    <section aria-label="Archives tiles">
      <h2 style={{ margin: '0 0 10px 0', fontSize: 22 }}>Archives</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            style={{
              display: 'block',
              padding: 16,
              borderRadius: 16,
              border: '1px solid rgba(0,0,0,0.12)',
              background: 'rgba(255,255,255,0.72)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16 }}>{t.title}</div>
            <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.5, opacity: 0.9 }}>{t.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
