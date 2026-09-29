import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FILTERABLE_CATEGORIES, vendorMatchesCategory } from '../data/categories';
import Icon from '../components/common/Icon';
import { Breadcrumb } from '../components/common';
import Decor from '../components/Hero/Decor';
import './pages.css';

/**
 * Category index. Each tile shows a real count of matching vendors — including
 * zero, which is the honest answer for the categories the source data does not
 * cover yet (spec §8).
 */
export default function Categories() {
  const { vendors, setFilters } = useApp();

  return (
    <div className="page">
      <header className="page-hero">
        <Decor scope="page" />
        <div className="container page-hero-inner">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
          <h1 className="page-title">
            Browse by <span className="accent">category</span>
          </h1>
          <p className="page-lede">
            Every service we plan to cover. Counts below reflect the vendors currently in this demo.
          </p>
        </div>
      </header>

      <div className="container">
        <ul className="cat-page-grid">
          {FILTERABLE_CATEGORIES.map((category) => {
            const count = vendors.filter((v) => vendorMatchesCategory(v, category)).length;
            return (
              <li key={category.id}>
                <Link
                  to={`/vendors?category=${category.id}`}
                  className={`cat-page-card tone-${category.tone}`}
                  onClick={() => setFilters({ categoryId: category.id })}
                >
                  <span className="cat-page-icon" aria-hidden="true">
                    <Icon name={category.icon} size={26} />
                  </span>
                  <span className="cat-page-text">
                    <span className="cat-page-label">{category.label}</span>
                    <span className="cat-page-count">
                      {count === 0
                        ? 'No vendors yet'
                        : `${count} ${count === 1 ? 'vendor' : 'vendors'}`}
                    </span>
                  </span>
                  <Icon name="arrowRight" size={18} className="cat-page-arrow" />
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="page-note">
          <Icon name="info" size={15} />
          <span>
            Nine listings come from the supplied vendor document; the rest are sample records
            written for this prototype. A category with no vendors in your city is a placeholder,
            not an empty listing.
          </span>
        </p>
      </div>
    </div>
  );
}
