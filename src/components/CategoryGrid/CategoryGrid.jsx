import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import './CategoryGrid.css';

/**
 * The nine category tiles (spec §8). Order is fixed by the design reference.
 *
 * Selecting a tile opens vendor discovery with that category pre-applied;
 * "All Categories" clears the category filter instead.
 */
export default function CategoryGrid({ variant = 'row', showHeading = false }) {
  const { setFilters } = useApp();
  const navigate = useNavigate();

  const open = (category) => {
    if (category.isAll) {
      setFilters({ categoryId: null });
      navigate('/vendors');
      return;
    }
    setFilters({ categoryId: category.id });
    navigate(`/vendors?category=${category.id}`);
  };

  return (
    <section className={`category-section cat-${variant}`} aria-labelledby={showHeading ? 'cat-heading' : undefined}>
      {showHeading && (
        <div className="section-head">
          <div>
            <h2 id="cat-heading" className="section-title">
              Browse by <span className="accent">Category</span>
            </h2>
            <p className="section-sub">Pick a service to see the vendors who provide it</p>
          </div>
        </div>
      )}

      <ul className="category-list">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              className={`category-tile tone-${category.tone}`}
              onClick={() => open(category)}
            >
              <span className="category-icon" aria-hidden="true">
                <Icon name={category.icon} size={38} />
              </span>
              <span className="category-label">{category.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
