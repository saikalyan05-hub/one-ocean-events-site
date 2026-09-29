import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ToastStack from './components/Toast/Toast';
import ModalHost from './components/Modal/ModalHost';
import CompareBar from './components/CompareBar/CompareBar';
import Home from './pages/Home';
import Vendors from './pages/Vendors';
import Categories from './pages/Categories';
import Wishlist from './pages/Wishlist';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import NotFound from './pages/NotFound';

/*
 * Dashboards live under their own nested routes so the sidebar and topbar stay
 * mounted while the panel swaps (update spec §23). They are demo surfaces with
 * no gate in front of them; real authorisation belongs on a server (§39).
 */
import ClientDashboard from './pages/dashboard/ClientDashboard';
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardWishlist from './pages/dashboard/DashboardWishlist';
import DashboardCompare from './pages/dashboard/DashboardCompare';
import DashboardBookings from './pages/dashboard/DashboardBookings';
import DashboardMessages from './pages/dashboard/DashboardMessages';
import DashboardNotifications from './pages/dashboard/DashboardNotifications';
import DashboardProfile from './pages/dashboard/DashboardProfile';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminBookings from './pages/admin/AdminBookings';
import AdminMessages from './pages/admin/AdminMessages';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

/**
 * Resets scroll on navigation, but honours in-page anchors (/about#contact)
 * and leaves back/forward restoration to the browser.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  /*
   * Page transition key (update spec §12). Keying the wrapper by the *first*
   * path segment replays a short fade whenever the visitor moves between
   * top-level areas, while leaving it untouched as they navigate within a
   * dashboard — so the dashboard's sidebar and topbar stay mounted (§23) and
   * only the panel inside swaps.
   */
  const { pathname } = useLocation();
  const routeKey = `/${pathname.split('/')[1] ?? ''}`;

  return (
    <AppProvider>
      <ScrollToTop />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header />

      <main id="main" tabIndex={-1}>
        <div className="route-fade" key={routeKey}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />

          <Route path="/dashboard" element={<ClientDashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="wishlist" element={<DashboardWishlist />} />
            <Route path="compare" element={<DashboardCompare />} />
            <Route path="bookings" element={<DashboardBookings />} />
            <Route path="messages" element={<DashboardMessages />} />
            <Route path="notifications" element={<DashboardNotifications />} />
            <Route path="profile" element={<DashboardProfile />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>

          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminHome />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
      </main>

      <Footer />

      <CompareBar />
      <ModalHost />
      <ToastStack />
    </AppProvider>
  );
}
