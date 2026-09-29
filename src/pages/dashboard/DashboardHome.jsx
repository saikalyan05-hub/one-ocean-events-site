import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import { formatBookingDate, groupBookings } from '../../components/Bookings/BookingSection';
import VendorCard from '../../components/FeaturedVendors/VendorCard';
import Icon from '../../components/common/Icon';
import { DemoTag } from '../../components/common';
import { SEED_ACTIVITY } from '../../data/demoData';
import { VENDORS } from '../../data/vendors';
import { relativeTime } from '../../utils/time';

export default function DashboardHome() {
  const { dashboardUser, bookings, wishlist, unreadMessages, isWishlisted } = useApp();

  const grouped = useMemo(() => groupBookings(bookings), [bookings]);

  // The soonest upcoming event, so the headline card always means something.
  const nextEvent = useMemo(() => {
    const sorted = [...grouped.upcoming].sort((a, b) => (a.eventDate < b.eventDate ? -1 : 1));
    return sorted[0] ?? null;
  }, [grouped.upcoming]);

  // Suggestions skip anything already saved, so the row never repeats the wishlist.
  const suggestions = useMemo(
    () => VENDORS.filter((v) => !isWishlisted(v.id)).slice(0, 4),
    [isWishlisted],
  );

  const cards = [
    {
      id: 'event',
      icon: 'calendar',
      tone: 'coral',
      label: 'Upcoming Event',
      value: nextEvent ? nextEvent.eventType : 'Nothing booked yet',
      sub: nextEvent ? formatBookingDate(nextEvent.eventDate) : 'Find a vendor to get started',
      to: '/dashboard/bookings',
    },
    {
      id: 'wishlist',
      icon: 'heart',
      tone: 'pink',
      label: 'Saved Vendors',
      value: `${wishlist.length} ${wishlist.length === 1 ? 'vendor' : 'vendors'}`,
      sub: 'Kept for later',
      to: '/dashboard/wishlist',
    },
    {
      id: 'bookings',
      icon: 'ticket',
      tone: 'teal',
      label: 'My Bookings',
      value: `${grouped.upcoming.length} ${grouped.upcoming.length === 1 ? 'booking' : 'bookings'}`,
      sub: 'Upcoming requests',
      to: '/dashboard/bookings',
    },
    {
      id: 'messages',
      icon: 'chat',
      tone: 'sky',
      label: 'Messages',
      value: `${unreadMessages} unread`,
      sub: 'From your vendors',
      to: '/dashboard/messages',
    },
  ];

  return (
    <>
      <DashHead
        title={`Hello, ${dashboardUser.firstName ?? dashboardUser.name} 👋`}
        lede="Let's plan your next event."
      />

      <ul className="dash-stats">
        {cards.map((card, i) => (
          <li key={card.id} className="rise" style={{ '--i': i }}>
            <Link to={card.to} className="stat-card">
              <span className={`stat-icon tone-${card.tone}`}>
                <Icon name={card.icon} size={20} />
              </span>
              <span>
                <span className="stat-label">{card.label}</span>
                <p className="stat-value">{card.value}</p>
                <p className="stat-sub">{card.sub}</p>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2 className="dash-section-title">Continue Planning</h2>
          <Link to="/vendors" className="dash-section-link">
            See all vendors
          </Link>
        </div>
        <ul className="vendor-grid">
          {suggestions.map((vendor, i) => (
            <li key={vendor.id} className="rise" style={{ '--i': i }}>
              <VendorCard vendor={vendor} eager={i < 2} />
            </li>
          ))}
        </ul>
      </section>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2 className="dash-section-title">Your Recent Activity</h2>
          <DemoTag label="Demo activity" notice="Sample activity written for this prototype." />
        </div>
        <div className="dash-card">
          <ul className="dash-feed">
            {SEED_ACTIVITY.map((item, i) => (
              <li key={item.id} className="feed-row rise" style={{ '--i': i }}>
                <span className={`feed-icon stat-icon tone-${item.tone}`}>
                  <Icon name={item.icon} size={16} />
                </span>
                <span>
                  <p className="feed-text">{item.text}</p>
                  <p className="feed-time">{relativeTime(item.at)}</p>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
