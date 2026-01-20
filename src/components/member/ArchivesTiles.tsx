export default function ArchivesTiles() {
  const tiles = [
    {
      id: 1,
      title: 'Memorabilia Archive',
      description: 'Browse member-curated memorabilia and artifacts.',
      href: '/memorabilia',
    },
    {
      id: 2,
      title: 'Photo Gallery',
      description: "Explore photos from Gehrig's life, career, and fan collections.",
      href: '/photos',
    },
    {
      id: 3,
      title: 'Library',
      description: 'Read articles, books, clippings, and historical references.',
      href: '/library',
    },
  ];

  return (
    <section style={{
      padding: '32px 20px',
      maxWidth: 900,
      margin: '0 auto',
      background: 'rgba(0,0,0,0.02)',
    }}>
      <h2 style={{
        fontSize: 22,
        margin: '0 0 20px 0',
        fontWeight: 700,
        textAlign: 'center',
      }}>
        Explore the Archives
      </h2>

      {/* Three horizontally-aligned tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 16,
      }}>
        {tiles.map((tile) => (
          <a
            key={tile.id}
            href={tile.href}
            style={{
              display: 'block',
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 12,
              padding: 20,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{
              fontSize: 18,
              fontWeight: 700,
              margin: '0 0 8px 0',
              color: 'var(--lgfc-blue)',
            }}>
              {tile.title}
            </h3>
            <p style={{
              fontSize: 14,
              margin: 0,
              color: 'rgba(0,0,0,0.7)',
              lineHeight: 1.5,
            }}>
              {tile.description}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
