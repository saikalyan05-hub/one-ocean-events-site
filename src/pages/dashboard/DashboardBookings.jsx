import { DashHead } from '../../components/Dashboard/DashboardLayout';
import BookingSection from '../../components/Bookings/BookingSection';

/**
 * My Bookings (update spec §8). The list, tabs and empty states come from the
 * same <BookingSection> the standalone /bookings page uses.
 */
export default function DashboardBookings() {
  return (
    <>
      <DashHead
        title="My Bookings"
        lede="Every request you have sent, grouped by what happens next."
      />
      <BookingSection idPrefix="dash-bookings" />
    </>
  );
}
