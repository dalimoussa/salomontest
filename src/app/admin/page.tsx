// Admin panel — fully client-side (uses localStorage + Zustand)
import { AdminPageClient } from '@/admin/AdminPageClient';

export const metadata = {
  title: 'Admin Console — SALOMON AI Concierge',
};

export default function AdminPage() {
  return <AdminPageClient />;
}
