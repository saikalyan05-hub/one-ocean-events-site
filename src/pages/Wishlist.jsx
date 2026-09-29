import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Breadcrumb, EmptyState } from '../components/common';
import VendorCard from '../components/FeaturedVendors/VendorCard';
import Decor from '../components/Hero/Decor';
import './pages.css';

export default function Wishlist() {
  const { wishlistVendors } = useApp();

  return (
    <div className="page">
      <header className="page-hero">
        <Decor scope="page" on="light" />
        <div className="container page-hero-inner">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
          <h1 className="page-title">
            Your <span className="accent">wishlist</span>
          </h1>
          <p className="page-lede">
            {wishlistVendors.length > 0
              ? `${wishlistVendors.length} ${wishlistVendors.length === 1 ? 'vendor' : 'vendors'} saved for later.`
              : 'Vendors you save appear here so you can come back to them.'}
          </p>
        </div>
      </header>

      <div className="container">
        {wishlistVendors.length > 0 ? (
          <ul className="vendor-grid">
            {wishlistVendors.map((vendor, i) => (
              <li key={vendor.id}>
                <VendorCard vendor={vendor} eager={i < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="heart"
            title="Nothing saved yet"
            text="Tap the heart on any vendor to keep them here while you decide."
            actions={
              <Link to="/vendors" className="btn btn-primary">
                Browse vendors
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
