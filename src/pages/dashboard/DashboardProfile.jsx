import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { DemoTag, Stars } from '../../components/common';
import LocationSelect from '../../components/common/LocationSelect';
import { SEED_MY_REVIEWS, SEED_SAVED_SEARCHES } from '../../data/demoData';
import { getVendorById } from '../../data/vendors';
import { shortDate } from '../../utils/time';
import '../Profile.css';

/**
 * My Profile (update spec §5, §6).
 *
 * Shows the demo customer, their saved searches and the reviews they have
 * written. Every one of those is invented for the prototype and labelled, and
 * no credential is stored or checked anywhere on this screen (spec §19).
 */
export default function DashboardProfile() {
  const { dashboardUser, wishlist, bookings, location, changeLocation } = useApp();

  const reviews = SEED_MY_REVIEWS.map((review) => ({
    ...review,
    vendor: getVendorById(review.vendorId),
  })).filter((review) => review.vendor);

  return (
    <>
      <DashHead title="My Profile" lede="Your details and preferences for this demo." />

      <div className="profile-grid">
        <section className="profile-card profile-identity">
          <span className="profile-avatar" aria-hidden="true">
            {dashboardUser.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className="profile-name wrap-anywhere">{dashboardUser.name}</h2>
            <p className="profile-email wrap-anywhere">{dashboardUser.email}</p>
            <span className="pill profile-role">Demo account</span>
          </div>
        </section>

        <section className="profile-card">
          <h2 className="profile-card-title">Your details</h2>
          <ul className="profile-notes">
            <li>
              <strong>Phone</strong> — {dashboardUser.phone ?? 'Not added'}
            </li>
            <li>
              <strong>City</strong> — {dashboardUser.location ?? 'Not set'}
            </li>
            <li>
              <strong>Member since</strong> — {shortDate(dashboardUser.memberSince)}
            </li>
          </ul>
        </section>

        <section className="profile-card">
          <h2 className="profile-card-title">Your activity</h2>
          <ul className="profile-stats">
            <li>
              <span className="profile-stat-value">{wishlist.length}</span>
              <span className="profile-stat-label">Saved vendors</span>
              <Link to="/dashboard/wishlist" className="profile-stat-link">
                My Wishlist <Icon name="arrowRight" size={15} />
              </Link>
            </li>
            <li>
              <span className="profile-stat-value">{bookings.length}</span>
              <span className="profile-stat-label">Bookings</span>
              <Link to="/dashboard/bookings" className="profile-stat-link">
                My Bookings <Icon name="arrowRight" size={15} />
              </Link>
            </li>
          </ul>
        </section>

        <section className="profile-card">
          <h2 className="profile-card-title">Preferences</h2>
          <LocationSelect
            id="dash-location"
            value={location}
            onChange={changeLocation}
            label="Default service location"
            variant="field"
            hideLabel={false}
          />
          <p className="field-hint">
            Used to pre-fill search and booking forms. Saved in this browser.
          </p>
        </section>

        <section className="profile-card">
          <h2 className="profile-card-title">Saved searches</h2>
          <ul className="saved-search-list">
            {SEED_SAVED_SEARCHES.map((search) => (
              <li key={search.id}>
                <Link
                  to={`/vendors?category=${search.categoryId}${search.query ? `&q=${encodeURIComponent(search.query)}` : ''}`}
                  className="saved-search"
                >
                  <Icon name="search" size={15} />
                  <span>
                    <span className="saved-search-label">{search.label}</span>
                    <span className="saved-search-meta">{search.location}</span>
                  </span>
                  <Icon name="arrowRight" size={15} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="profile-card">
          <h2 className="profile-card-title">
            Your reviews <DemoTag label="Demo" notice="Sample reviews written for this prototype." />
          </h2>
          <ul className="my-review-list">
            {reviews.map((review) => (
              <li key={review.id}>
                <p className="my-review-vendor wrap-anywhere">{review.vendor.facts.name}</p>
                <Stars value={review.rating} showTag={false} />
                <p className="my-review-text wrap-anywhere">“{review.text}”</p>
                <p className="feed-time">{shortDate(review.at)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="profile-card profile-security">
          <h2 className="profile-card-title">
            <Icon name="shield" size={17} /> About this account
          </h2>
          <ul className="profile-notes">
            <li>This is a demo profile. No password was collected and none is checked.</li>
            <li>Your wishlist, bookings and messages live in this browser only.</li>
            <li>
              In production this becomes a real account: hashed passwords, an HTTP-only session
              cookie, rate limiting and server-side authorisation on every booking.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
