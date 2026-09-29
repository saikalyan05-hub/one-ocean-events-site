import { Breadcrumb } from '../components/common';
import BookingSection from '../components/Bookings/BookingSection';
import Decor from '../components/Hero/Decor';
import './pages.css';

export default function Bookings() {
  return (
    <div className="page">
      <header className="page-hero">
        <Decor scope="page" />
        <div className="container page-hero-inner">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'My Bookings' }]} />
          <h1 className="page-title">
            My <span className="accent">bookings</span>
          </h1>
          <p className="page-lede">
            Every request you send is listed here with its reference number and status.
          </p>
        </div>
      </header>

      <div className="container">
        <BookingSection />
      </div>
    </div>
  );
}
