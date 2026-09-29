import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import './Dashboard.css';

/**
 * The shared dashboard shell.
 *
 * One component serves both the client dashboard and the admin dashboard: the
 * sidebar and topbar are rendered once and stay mounted while nested routes
 * swap inside <Outlet>, so moving between screens cross-fades the panel without
 * rebuilding the layout (update spec §23).
 *
 * These dashboards are demo surfaces. They are intentionally NOT gated behind a
 * credential check — the demo ships no password to type, and a fake gate would
 * only teach a bad pattern. Real authorisation belongs on a server (spec §39).
 */

export default function DashboardLayout({ nav, user, role, homePath }) {
  const { logout, toast } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Each panel starts at the top rather than inheriting the previous scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    toast('Signed out of the demo. Nothing was stored on a server.', 'info');
    navigate('/');
  };

  return (
    <div className="page dash">
      <div className="container dash-grid">
        <nav className="dash-side" aria-label={`${role} menu`}>
          <div className="dash-side-head">
            <span className="dash-avatar" aria-hidden="true">
              {initials}
            </span>
            <div>
              <p className="dash-side-name">{user.name}</p>
              <p className="dash-side-role">{role}</p>
            </div>
          </div>

          <ul className="dash-nav">
            {nav.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.to === homePath}
                  className={({ isActive }) =>
                    `dash-link ${isActive && !item.external ? 'is-on' : ''}`.trim()
                  }
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="dash-link-badge">
                      {item.badge}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
            <li>
              <button type="button" className="dash-link dash-link-logout" onClick={handleLogout}>
                <Icon name="logout" size={18} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* A div, not <main>: App already provides the page-level main landmark. */}
        <div className="dash-main">
          <div key={pathname} className="dash-panel">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shared heading block so every dashboard screen introduces itself the same way. */
export function DashHead({ title, lede, children }) {
  return (
    <header className="dash-head">
      <h1 className="dash-title">{title}</h1>
      {lede && <p className="dash-lede">{lede}</p>}
      {children}
    </header>
  );
}
