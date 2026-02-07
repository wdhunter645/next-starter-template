'use client';
import PageShell from "@/components/PageShell";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <PageShell title="Admin Dashboard" subtitle="Site operations, content, and system tools">
      <AdminDashboard />
    </PageShell>
  );
}
