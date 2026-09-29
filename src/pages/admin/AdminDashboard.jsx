import { DEMO_ADMIN } from '../../data/demoData';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

/**
 * Admin dashboard shell (update spec §13).
 *
 * Plain labels, same as the client side: "Customers", not "Customer
 * Relationship Management"; "Reports", not "Analytics Intelligence".
 *
 * This is a demo surface with no server behind it, so nothing here is gated. In
 * production every one of these screens would require an authenticated admin
 * session checked server-side, with the actions audit-logged (spec §39).
 */
const NAV = [
  { label: 'Dashboard', icon: 'home', to: '/admin' },
  { label: 'Customers', icon: 'users', to: '/admin/customers' },
  { label: 'Vendors', icon: 'store', to: '/admin/vendors' },
  { label: 'Bookings', icon: 'calendar', to: '/admin/bookings' },
  { label: 'Messages', icon: 'chat', to: '/admin/messages' },
  { label: 'Reviews', icon: 'star', to: '/admin/reviews' },
  { label: 'Announcements', icon: 'megaphone', to: '/admin/announcements' },
  { label: 'Reports', icon: 'chart', to: '/admin/reports' },
  { label: 'Settings', icon: 'settings', to: '/admin/settings' },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout nav={NAV} homePath="/admin" user={DEMO_ADMIN} role="Admin — demo" />
  );
}
