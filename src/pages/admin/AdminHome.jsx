import { Link } from 'react-router-dom';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { DemoTag, Loading, SafeImage, Stars } from '../../components/common';
import useAsync from '../../hooks/useAsync';
import * as api from '../../services/api';
import { categorySlug } from '../../data/vendors';
import { relativeTime, shortDate } from '../../utils/time';

const inr = (n) => (n == null ? 'On request' : `₹${n.toLocaleString('en-IN')}`);

/**
 * Admin home (update spec §14).
 *
 * The six headline figures are DEMO NUMBERS. They are not counts of anything in
 * this bundle, and the screen says so above the grid. The three lists below
 * them, by contrast, are read from the shared demo model, so a booking
 * cancelled on the customer side shows as cancelled here (§25).
 */
export default function AdminHome() {
  const { data, loading } = useAsync(api.getAdminOverview);

  if (loading || !data) return <Loading label="Loading dashboard…" />;

  const { stats, recentBookings, newVendors, recentReviews } = data;

  return (
    <>
      <DashHead title="Good morning, Admin 👋" lede="Here's what's happening today." />

      <p className="dash-demo-note">
        <Icon name="info" size={15} />
        <span>
          These are <strong>demo numbers only</strong> — invented for the prototype, not measured
          from real activity.
        </span>
      </p>

      <ul className="dash-stats">
        {stats.map((stat, i) => (
          <li key={stat.id} className="stat-card rise" style={{ '--i': i }}>
            <span className={`stat-icon tone-${stat.tone}`}>
              <Icon name={stat.icon} size={20} />
            </span>
            <span>
              <span className="stat-label">{stat.label}</span>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-sub">Demo figure</p>
            </span>
          </li>
        ))}
      </ul>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2 className="dash-section-title">Recent Bookings</h2>
          <Link to="/admin/bookings" className="dash-section-link">
            View all
          </Link>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <caption className="sr-only">The five most recent demo bookings</caption>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Vendor</th>
                <th scope="col">Event</th>
                <th scope="col">
                  Amount <DemoTag notice="Demo estimate from placeholder pricing." />
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((row) => (
                <tr key={row.id}>
                  <td className="cell-strong">{row.customerName}</td>
                  <td>
                    <span className="cell-strong wrap-anywhere">{row.vendorName}</span>
                    <span className="cell-sub">{row.vendorCategory}</span>
                  </td>
                  <td>
                    {row.eventType}
                    <span className="cell-sub">{shortDate(row.eventDate)}</span>
                  </td>
                  <td>{inr(row.amount)}</td>
                  <td>
                    <span className={`pill status-${categorySlug(row.status)}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2 className="dash-section-title">New Vendors</h2>
          <Link to="/admin/vendors" className="dash-section-link">
            View all
          </Link>
        </div>
        <div className="dash-card">
          <ul className="dash-feed">
            {newVendors.map((vendor, i) => (
              <li key={vendor.id} className="feed-row rise" style={{ '--i': i }}>
                <SafeImage src={vendor.image} alt="" className="cell-thumb" />
                <span style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <p className="feed-text wrap-anywhere">
                    <strong>{vendor.name}</strong> — {vendor.category}
                  </p>
                  <p className="feed-time">
                    Submitted {vendor.submitted ? relativeTime(vendor.submitted) : 'recently'} ·{' '}
                    {vendor.location}
                  </p>
                </span>
                <span className="pill status-pending">Pending</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2 className="dash-section-title">Recent Reviews</h2>
          <Link to="/admin/reviews" className="dash-section-link">
            View all
          </Link>
        </div>
        <div className="dash-card">
          <ul className="dash-feed">
            {recentReviews.map((review, i) => (
              <li key={review.id} className="feed-row rise" style={{ '--i': i }}>
                <SafeImage src={review.vendorImage} alt="" className="cell-thumb" />
                <span style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <p className="feed-text wrap-anywhere">
                    <strong>{review.author}</strong> on {review.vendorName}
                  </p>
                  <p className="feed-text wrap-anywhere">“{review.text}”</p>
                  <p className="feed-time">{relativeTime(review.at)}</p>
                </span>
                <Stars value={review.rating} showTag={false} />
              </li>
            ))}
          </ul>
          <p className="page-note">
            <Icon name="info" size={15} />
            <span>
              These are demo reviews written for the prototype. They are not real customer feedback.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
