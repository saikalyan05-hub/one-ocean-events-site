import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import { DemoTag, EmptyState, SafeImage } from '../common';
import { categorySlug } from '../../data/vendors';
import './BookingSection.css';

/**
 * The bookings list, tabs and empty states.
 *
 * Shared deliberately: the standalone /bookings route and the dashboard's
 * Bookings screen render this same component rather than two copies that drift
 * apart (update spec §1).
 */

const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

export const formatBookingDate = (iso) => {
  if (!iso) return 'Date not set';
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

/** Compares dates only, so an event happening today still counts as upcoming. */
export const isPast = (iso) => {
  if (!iso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${iso}T00:00:00`) < today;
};

/** Groups bookings the same way the tabs do — exported so cards can count them. */
export function groupBookings(bookings) {
  const groups = { upcoming: [], completed: [], cancelled: [] };
  bookings.forEach((booking) => {
    if (booking.status === 'Cancelled') groups.cancelled.push(booking);
    else if (booking.status === 'Completed' || isPast(booking.eventDate)) {
      groups.completed.push(booking);
    } else groups.upcoming.push(booking);
  });
  return groups;
}

export default function BookingSection({ idPrefix = 'bookings' }) {
  const { bookings, cancelBooking, openModal } = useApp();
  const [tab, setTab] = useState('upcoming');
  const [pending, setPending] = useState(null);

  const grouped = useMemo(() => groupBookings(bookings), [bookings]);
  const visible = grouped[tab];

  const handleCancel = async (booking) => {
    setPending(booking.id);
    try {
      await cancelBooking(booking.id);
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <div className="chip-row" role="tablist" aria-label="Booking status">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`${idPrefix}-panel`}
            className={`chip ${tab === item.id ? 'is-on' : ''}`.trim()}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            <span className="chip-count">{grouped[item.id].length}</span>
          </button>
        ))}
      </div>

      <div
        id={`${idPrefix}-panel`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${tab}`}
        tabIndex={-1}
      >
        {visible.length > 0 ? (
          <ul className="booking-list stagger">
            {visible.map((booking, i) => (
              <li key={booking.id} className="booking-card rise" style={{ '--i': i }}>
                <SafeImage src={booking.vendorImage} alt="" className="booking-img" />

                <div className="booking-main">
                  <div className="booking-top">
                    <h2 className="booking-vendor wrap-anywhere">{booking.vendorName}</h2>
                    <span className={`pill booking-status status-${categorySlug(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <p className="booking-ref">
                    Reference <strong>{booking.reference}</strong>
                    <span aria-hidden="true"> • </span>
                    {booking.vendorCategory}
                  </p>

                  <ul className="booking-meta">
                    <li>
                      <Icon name="calendar" size={15} />
                      {formatBookingDate(booking.eventDate)}
                    </li>
                    <li>
                      <Icon name="sparkle" size={15} />
                      {booking.eventType}
                    </li>
                    <li>
                      <Icon name="pin" size={15} />
                      {booking.location}
                    </li>
                    <li>
                      <Icon name="user" size={15} />
                      {booking.guestCount.toLocaleString('en-IN')} guests
                    </li>
                  </ul>

                  {booking.notes && <p className="booking-notes wrap-anywhere">“{booking.notes}”</p>}

                  {booking.estimate != null && (
                    <p className="booking-estimate">
                      Indicative total <strong>{inr(booking.estimate)}</strong>{' '}
                      <DemoTag notice="Demo estimate from placeholder pricing — not a quote." />
                    </p>
                  )}
                </div>

                <div className="booking-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openModal('vendor', { vendorId: booking.vendorId })}
                  >
                    <Icon name="eye" size={15} /> View
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openModal('chat', { vendorId: booking.vendorId })}
                  >
                    <Icon name="chat" size={15} /> Message
                  </button>
                  {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm booking-cancel"
                      disabled={pending === booking.id}
                      onClick={() => handleCancel(booking)}
                    >
                      {pending === booking.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="calendar"
            title={
              tab === 'upcoming'
                ? 'No upcoming bookings yet 📅'
                : tab === 'completed'
                  ? 'Nothing completed yet'
                  : 'Nothing cancelled'
            }
            text={
              tab === 'upcoming'
                ? 'Find a vendor you like and send them a request — it will show up here.'
                : 'Bookings move into this tab automatically.'
            }
            actions={
              tab === 'upcoming' ? (
                <Link to="/vendors" className="btn btn-primary">
                  Find Vendors
                </Link>
              ) : null
            }
          />
        )}
      </div>

      <p className="page-note">
        <Icon name="info" size={15} />
        <span>
          Demo bookings are stored in this browser only. Clearing site data removes them, and no
          vendor has been contacted.
        </span>
      </p>
    </>
  );
}
