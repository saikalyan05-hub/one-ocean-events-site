import { useMemo, useState } from 'react';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { DemoTag, EmptyState, Loading, SafeImage } from '../../components/common';
import useAsync from '../../hooks/useAsync';
import * as api from '../../services/api';
import { categorySlug } from '../../data/vendors';
import { shortDate } from '../../utils/time';

const inr = (n) => (n == null ? 'On request' : `₹${n.toLocaleString('en-IN')}`);

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

/**
 * Booking management (update spec §17).
 *
 * The rows are the visitor's own bookings merged with the other demo customers'
 * — so cancelling a booking on the customer side changes what this table shows
 * (§25). Amounts are demo estimates built from placeholder prices, never quotes.
 */
export default function AdminBookings() {
  const { data, loading } = useAsync(api.listAdminBookings);
  const [filter, setFilter] = useState('All');

  const counts = useMemo(() => {
    const list = data ?? [];
    return FILTERS.reduce((acc, name) => {
      acc[name] = name === 'All' ? list.length : list.filter((row) => row.status === name).length;
      return acc;
    }, {});
  }, [data]);

  const rows = useMemo(() => {
    const list = data ?? [];
    return filter === 'All' ? list : list.filter((row) => row.status === filter);
  }, [data, filter]);

  if (loading || !data) return <Loading label="Loading bookings…" />;

  return (
    <>
      <DashHead title="Bookings" lede="Every booking request across the demo marketplace." />

      <div className="chip-row" role="tablist" aria-label="Booking status">
        {FILTERS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={filter === name}
            className={`chip ${filter === name ? 'is-on' : ''}`.trim()}
            onClick={() => setFilter(name)}
          >
            {name}
            <span className="chip-count">{counts[name]}</span>
          </button>
        ))}
      </div>

      {rows.length > 0 ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <caption className="sr-only">Demo bookings across all customers</caption>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Vendor</th>
                <th scope="col">Event</th>
                <th scope="col">Date</th>
                <th scope="col">Guests</th>
                <th scope="col">
                  Amount <DemoTag notice="Demo estimate from placeholder pricing — not a quote." />
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="cell-strong wrap-anywhere">{row.customerName}</span>
                    <span className="cell-sub">{row.reference}</span>
                  </td>
                  <td>
                    <span className="cell-name">
                      <SafeImage src={row.vendorImage} alt="" className="cell-thumb" />
                      <span style={{ minWidth: 0 }}>
                        <span className="cell-strong wrap-anywhere">{row.vendorName}</span>
                        <span className="cell-sub">{row.vendorCategory}</span>
                      </span>
                    </span>
                  </td>
                  <td>{row.eventType}</td>
                  <td>{shortDate(row.eventDate)}</td>
                  <td>{row.guestCount?.toLocaleString('en-IN') ?? '—'}</td>
                  <td>{inr(row.amount)}</td>
                  <td>
                    <span className={`pill status-${categorySlug(row.status)}`}>{row.status}</span>
                    {row.live && <span className="cell-sub">Your booking</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="calendar"
          title={`No ${filter.toLowerCase()} bookings`}
          text="Pick another status to see the rest."
          actions={
            <button type="button" className="btn btn-primary" onClick={() => setFilter('All')}>
              Show all bookings
            </button>
          }
        />
      )}

      <p className="page-note">
        <Icon name="info" size={15} />
        <span>
          Bookings you make as the customer appear here too, marked “Your booking”. No payment has
          been taken and no vendor has been notified.
        </span>
      </p>
    </>
  );
}
