import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import Logo from '../Header/Logo';
import Decor from '../Hero/Decor';
import './Footer.css';

/** Footer link groups (spec §22). Kept to five short columns to avoid crowding. */
const GROUPS = [
  {
    title: 'One Ocean Events',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/about#contact' },
      { label: 'How It Works', to: '/how-it-works' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Vendors', to: '/vendors' },
      { label: 'Categories', to: '/categories' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Bookings', to: '/bookings' },
      { label: 'My Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Vendor',
    links: [
      { label: 'Become a Vendor', to: '/about#vendors' },
      { label: 'Vendor Login', to: '/profile' },
      /* The demo admin view. Nothing behind it is gated, which the screens say. */
      { label: 'Admin Dashboard', to: '/admin' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help', to: '/how-it-works' },
      { label: 'FAQs', to: '/how-it-works#faqs' },
      { label: 'Contact', to: '/about#contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/about#legal' },
      { label: 'Terms', to: '/about#legal' },
      { label: 'Refund & Cancellation', to: '/about#legal' },
    ],
  },
];

/* Evaluated once at module load rather than on every render. */
const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer on-dark">
      <Decor scope="page" on="dark" />
      <div className="container footer-inner">
        <div className="footer-brand">
          {/* The real brand lockup, not a text stand-in — one mark across the site. */}
          <Logo />
          <p className="footer-tagline">
            Discover, compare and book trusted event vendors for weddings, parties and every
            celebration in between.
          </p>
          <p className="footer-demo">
            <Icon name="info" size={15} />
            <span>
              Demo prototype. Ratings, reviews, prices and verification badges are placeholder data.
            </span>
          </p>
        </div>

        <nav className="footer-groups" aria-label="Footer">
          {GROUPS.map((group) => (
            <div key={group.title} className="footer-group">
              <h2 className="footer-group-title">{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="container footer-bottom">
        <p>© {YEAR} One Ocean Events. Demo prototype — not a live marketplace.</p>
        <p className="footer-city">
          <Icon name="pin" size={14} /> Serving Hyderabad and nearby cities
        </p>
      </div>
    </footer>
  );
}
