import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Admin Dashboard</h1>
      <p style={{ opacity: 0.9, lineHeight: 1.4, marginBottom: 32 }}>
        Manage content and site administration
      </p>

      <div style={{ display: 'grid', gap: 16 }}>
        <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Content Management</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            <li>
              <Link 
                href="/admin/cms" 
                style={{ 
                  color: '#0070f3', 
                  textDecoration: 'none',
                  fontSize: 16
                }}
              >
                → CMS Content Blocks
              </Link>
              <p style={{ fontSize: 14, opacity: 0.8, margin: '4px 0 0 20px' }}>
                Edit page content blocks with markdown (draft/publish workflow)
              </p>
            </li>
          </ul>
        </section>

        <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Other Tools</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            <li>
              <Link 
                href="/admin/content" 
                style={{ 
                  color: '#0070f3', 
                  textDecoration: 'none',
                  fontSize: 16
                }}
              >
                → Legacy Page Content
              </Link>
              <p style={{ fontSize: 14, opacity: 0.8, margin: '4px 0 0 20px' }}>
                Legacy page content editor (deprecated)
              </p>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
