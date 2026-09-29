import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_IMAGES } from '../../data/images';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import { SafeImage } from '../common';
import './CategoryGrid.css';

/**
 * The nine category tiles (spec §8). Order is fixed by the design reference.
 *
 * Each tile is a centred column — inset photograph, label, then a round gold
 * arrow button — on a pastel card with a gold hairline. "All Categories" is the
 * one exception: it is a shortcut rather than a service, so it renders as a
 * glyph panel instead of borrowing someone else's photograph.
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
    <section
      className={`category-section cat-${variant}`}
      aria-labelledby={showHeading ? 'cat-heading' : undefined}
    >
      {showHeading && (
        <div className="section-head">
          <div>
            <h2 id="cat-heading" className="section-title">
              Explore by <span className="accent-pink">Event</span>
            </h2>
            <p className="section-sub">Find the perfect professionals for your special occasion</p>
          </div>
        </div>
      )}

      <ul className="category-list">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              className={`category-tile tone-${category.tone}${category.isAll ? ' category-all' : ''}`}
              onClick={() => open(category)}
            >
              <span className="category-media" aria-hidden="true">
                {category.isAll ? (
                  <span className="category-allmark">
                    <Icon name={category.icon} size={30} />
                  </span>
                ) : (
                  <SafeImage
                    src={CATEGORY_IMAGES[category.id]}
                    alt=""
                    className="category-img"
                    aria-hidden="true"
                  />
                )}
                <span className="category-tint" />
                <span className="category-chip">
                  <Icon name={category.icon} size={17} />
                </span>
              </span>

              <span className="category-body">
                <span className="category-label">{category.label}</span>
              </span>

              <span className="category-go" aria-hidden="true">
                <Icon name="arrowRight" size={14} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
