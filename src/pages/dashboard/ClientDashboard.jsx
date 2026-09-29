import { useApp } from '../../context/AppContext';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

/**
 * Client dashboard shell (update spec §6).
 *
 * Labels are the plain words a first-time visitor would use — "My Bookings",
 * not "Booking Management"; "Find Vendors", not "Vendor Acquisition" — and
 * every item pairs an icon with its text.
 */
export default function ClientDashboard() {
  const { dashboardUser, wishlist, unreadMessages, unreadNotifications } = useApp();

  const nav = [
    { label: 'Home', icon: 'home', to: '/dashboard' },
    { label: 'Find Vendors', icon: 'search', to: '/vendors', external: true },
    { label: 'My Wishlist', icon: 'heart', to: '/dashboard/wishlist', badge: wishlist.length },
    { label: 'Compare', icon: 'scale', to: '/dashboard/compare' },
    { label: 'My Bookings', icon: 'calendar', to: '/dashboard/bookings' },
    { label: 'Messages', icon: 'chat', to: '/dashboard/messages', badge: unreadMessages },
    {
      label: 'Notifications',
      icon: 'bell',
      to: '/dashboard/notifications',
      badge: unreadNotifications,
    },
    { label: 'My Profile', icon: 'user', to: '/dashboard/profile' },
    { label: 'Settings', icon: 'settings', to: '/dashboard/settings' },
  ];

  return (
    <DashboardLayout
      nav={nav}
      homePath="/dashboard"
      user={dashboardUser}
      role="Customer account"
    />
  );
}
