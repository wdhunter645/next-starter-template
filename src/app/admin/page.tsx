'use client';

import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <PageShell title="Admin Dashboard" subtitle="Site operations, content, and system tools">
      <AdminNav />
      <AdminDashboard />
    </PageShell>
  );
}
