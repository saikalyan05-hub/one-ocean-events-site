import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import LocationSelect from '../common/LocationSelect';
import Logo from './Logo';
import './Header.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/vendors', label: 'Vendors' },
  { to: '/categories', label: 'Categories' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About Us' },
];

export default function Header() {
  const { wishlist, compare, user, location: city, changeLocation, openModal } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const toggleRef = useRef(null);

  /* Close the drawer on navigation so the menu never lingers over a new page. */
  useEffect(() => setMenuOpen(false), [routeLocation.pathname]);

  /* Subtle elevation once the page scrolls under the sticky header. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Drawer: lock scroll, close on Escape, move focus in and back out. */
  useEffect(() => {
    if (!menuOpen) return undefined;
    // Captured now: the cleanup must focus the node that opened the drawer.
    const toggle = toggleRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    drawerRef.current?.querySelector('a, button')?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      toggle?.focus();
    };
  }, [menuOpen]);

  const goProfile = () => navigate('/profile');

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`.trim()}>
      <div className="header-inner container">
        <Logo />

        <nav className="header-nav" aria-label="Primary">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`.trim()}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <div className="header-loc">
            <LocationSelect value={city} onChange={changeLocation} label="Service location" />
          </div>

          <span className="icon-btn-wrap">
            <button
              type="button"
              className="icon-btn tip"
              data-tip="Wishlist"
              aria-label={`Wishlist, ${wishlist.length} saved`}
              onClick={() => navigate('/wishlist')}
            >
              <Icon name="heart" size={19} />
            </button>
            {wishlist.length > 0 && <span className="count-badge">{wishlist.length}</span>}
          </span>

          {/* The reference header carries only location, wishlist, profile and
              Login, so this shortcut appears once there is something to compare.
              Nothing is lost while it is hidden: Compare is started from the
              vendor cards and the floating compare bar, which is on screen
              whenever this button is. */}
          {compare.length > 0 && (
            <span className="icon-btn-wrap header-compare">
              <button
                type="button"
                className="icon-btn tip"
                data-tip="Compare"
                aria-label={`Comparison list, ${compare.length} selected`}
                onClick={() => openModal('compare')}
              >
                <Icon name="scale" size={19} />
              </button>
              <span className="count-badge">{compare.length}</span>
            </span>
          )}

          <span className="icon-btn-wrap header-profile">
            <button
              type="button"
              className="icon-btn tip"
              data-tip={user ? 'Your profile' : 'Profile'}
              aria-label={user ? `Profile — signed in as ${user.name}` : 'Profile'}
              onClick={goProfile}
            >
              <Icon name="user" size={19} />
            </button>
            {user && <span className="count-badge count-dot" aria-hidden="true" />}
          </span>

          {user ? (
            <button type="button" className="btn btn-secondary btn-sm header-cta" onClick={() => navigate('/profile')}>
              {user.name.split(' ')[0]}
            </button>
          ) : (
            <button type="button" className="btn btn-primary header-cta" onClick={() => openModal('login')}>
              Login
            </button>
          )}
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="header-burger"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      {/* ------------------------------------------------------ mobile drawer */}
      <div
        className={`mobile-scrim ${menuOpen ? 'is-open' : ''}`.trim()}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-menu"
        ref={drawerRef}
        className={`mobile-menu ${menuOpen ? 'is-open' : ''}`.trim()}
        hidden={!menuOpen}
      >
        <nav aria-label="Mobile">
          <ul className="mobile-nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `mobile-link ${isActive ? 'is-active' : ''}`.trim()}
                >
                  {item.label}
                  <Icon name="chevronRight" size={16} />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-divider" />

        <ul className="mobile-nav">
          <li>
            <NavLink to="/wishlist" className="mobile-link">
              <span className="mobile-link-lead">
                <Icon name="heart" size={17} /> Wishlist
              </span>
              <span className="mobile-count">{wishlist.length}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/bookings" className="mobile-link">
              <span className="mobile-link-lead">
                <Icon name="ticket" size={17} /> My Bookings
              </span>
              <Icon name="chevronRight" size={16} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className="mobile-link">
              <span className="mobile-link-lead">
                <Icon name="user" size={17} /> Profile
              </span>
              <Icon name="chevronRight" size={16} />
            </NavLink>
          </li>
          {/* Dashboard entry points live in the drawer only — the desktop
              header matches the supplied design and stays exactly as it is. */}
          <li>
            <NavLink to="/dashboard" className="mobile-link">
              <span className="mobile-link-lead">
                <Icon name="home" size={17} /> My Dashboard
              </span>
              <Icon name="chevronRight" size={16} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin" className="mobile-link">
              <span className="mobile-link-lead">
                <Icon name="shield" size={17} /> Admin Dashboard
              </span>
              <Icon name="chevronRight" size={16} />
            </NavLink>
          </li>
        </ul>

        <div className="mobile-loc">
          <LocationSelect
            value={city}
            onChange={changeLocation}
            variant="field"
            label="Service location"
            hideLabel={false}
          />
        </div>

        {user ? (
          <button type="button" className="btn btn-secondary btn-block" onClick={() => navigate('/profile')}>
            <Icon name="user" size={17} /> {user.name}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              setMenuOpen(false);
              openModal('login');
            }}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
