import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import VendorCard from '../../components/FeaturedVendors/VendorCard';
import { EmptyState } from '../../components/common';

/** My Wishlist (update spec §9). Seeded with eight vendors so it is never bare. */
export default function DashboardWishlist() {
  const { wishlistVendors } = useApp();

  return (
    <>
      <DashHead
        title="My Wishlist"
        lede={
          wishlistVendors.length > 0
            ? `${wishlistVendors.length} ${wishlistVendors.length === 1 ? 'vendor' : 'vendors'} saved for later.`
            : 'Vendors you save are kept here.'
        }
      />

      {wishlistVendors.length > 0 ? (
        <ul className="vendor-grid">
          {wishlistVendors.map((vendor, i) => (
            <li key={vendor.id} className="rise" style={{ '--i': i }}>
              <VendorCard vendor={vendor} eager={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="heart"
          title="No saved vendors yet ❤️"
          text="Find a vendor and save them here."
          actions={
            <Link to="/vendors" className="btn btn-primary">
              Find Vendors
            </Link>
          }
        />
      )}
    </>
  );
}
