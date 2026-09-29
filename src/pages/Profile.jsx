import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { storageAvailable } from '../utils/storage';
import Icon from '../components/common/Icon';
import { Breadcrumb, EmptyState } from '../components/common';
import LocationSelect from '../components/common/LocationSelect';
import Decor from '../components/Hero/Decor';
import './pages.css';
import './Profile.css';

/**
 * Account placeholder (spec §16). Shows the locally stored demo session and is
 * explicit about what is and is not real, so nobody mistakes it for an account.
 */
export default function Profile() {
  const {
    user,
    logout,
    openModal,
    wishlistVendors,
    bookings,
    location,
    changeLocation,
  } = useApp();

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="page">
      <header className="page-hero">
        <Decor scope="page" on="light" />
        <div className="container page-hero-inner">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Profile' }]} />
          <h1 className="page-title">
            Your <span className="accent">profile</span>
          </h1>
          <p className="page-lede">Preferences and activity for this demo session.</p>
        </div>
      </header>

      <div className="container">
        {user ? (
          <div className="profile-grid">
            <section className="profile-card profile-identity">
              <span className="profile-avatar" aria-hidden="true">
                {initial}
              </span>
              <div>
                <h2 className="profile-name wrap-anywhere">{user.name}</h2>
                <p className="profile-email wrap-anywhere">{user.email}</p>
                <span className="pill profile-role">Demo session</span>
              </div>
              <button type="button" className="btn btn-secondary btn-sm profile-signout" onClick={logout}>
                <Icon name="logout" size={15} /> Sign out
              </button>
            </section>

            <section className="profile-card">
              <h2 className="profile-card-title">Your activity</h2>
              <ul className="profile-stats">
                <li>
                  <span className="profile-stat-value">{wishlistVendors.length}</span>
                  <span className="profile-stat-label">Saved vendors</span>
                  <Link to="/wishlist" className="profile-stat-link">
                    View wishlist <Icon name="arrowRight" size={15} />
                  </Link>
                </li>
                <li>
                  <span className="profile-stat-value">{bookings.length}</span>
                  <span className="profile-stat-label">Booking requests</span>
                  <Link to="/bookings" className="profile-stat-link">
                    View bookings <Icon name="arrowRight" size={15} />
                  </Link>
                </li>
              </ul>
            </section>

            <section className="profile-card">
              <h2 className="profile-card-title">Preferences</h2>
              <LocationSelect
                id="profile-location"
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

            <section className="profile-card profile-security">
              <h2 className="profile-card-title">
                <Icon name="shield" size={17} /> About this sign-in
              </h2>
              <ul className="profile-notes">
                <li>No password was collected and no credential was checked.</li>
                <li>Your name and email are stored in this browser only, never transmitted.</li>
                <li>
                  In production this becomes a real account: hashed passwords, an HTTP-only session
                  cookie, rate limiting and server-side authorisation on every booking.
                </li>
                <li>Clearing site data signs you out and deletes the demo bookings with it.</li>
              </ul>
            </section>
          </div>
        ) : (
          <EmptyState
            icon="user"
            title="You are browsing as a guest"
            text="Sign in to the demo to keep your wishlist and bookings labelled with your name. Everything stays in this browser."
            actions={
              <button type="button" className="btn btn-primary" onClick={() => openModal('login')}>
                Sign in
              </button>
            }
          />
        )}

        {/*
         * Entry points to the two demo dashboards (update spec §6, §13). Shown to
         * guests as well as signed-in visitors: the dashboards fall back to the
         * demo customer, so neither one opens as an empty shell, and nothing here
         * is a credential check.
         */}
        <section className="profile-card profile-dash">
          <h2 className="profile-card-title">
            <Icon name="grid" size={17} /> Demo dashboards
          </h2>
          <p className="field-hint">
            Two extra views of the same demo data: yours as a customer, and the operations view
            an administrator would see. Both are open in this prototype — a real build would
            check an admin session on the server before showing the second one.
          </p>
          <div className="profile-dash-links">
            <Link to="/dashboard" className="btn btn-primary">
              <Icon name="home" size={16} /> My Dashboard
            </Link>
            <Link to="/admin" className="btn btn-secondary">
              <Icon name="shield" size={16} /> Admin Dashboard
            </Link>
          </div>
        </section>

        {!storageAvailable && (
          <p className="page-note page-note-warn">
            <Icon name="info" size={15} />
            <span>
              This browser is blocking local storage, so your wishlist and bookings will reset when
              you reload.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
