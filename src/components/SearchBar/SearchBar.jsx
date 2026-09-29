import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import LocationSelect from '../common/LocationSelect';
import './SearchBar.css';

/**
 * Primary call to action: vendor/service text search + location + Search button.
 *
 * `variant="hero"` submits by navigating to vendor discovery with the query and
 * location carried across in app state (spec §6). `variant="page"` is used on the
 * discovery page itself and applies filters in place.
 */
export default function SearchBar({ variant = 'hero', onSubmit }) {
  const { filters, setFilters, location, changeLocation } = useApp();
  const [term, setTerm] = useState(filters.query);
  const navigate = useNavigate();
  const id = useId();

  /* Keep the field in step when filters change elsewhere (category chips, reset). */
  useEffect(() => setTerm(filters.query), [filters.query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = term.trim();
    setFilters({ query, location });
    if (onSubmit) {
      onSubmit(query);
      return;
    }
    navigate(query ? `/vendors?q=${encodeURIComponent(query)}` : '/vendors');
  };

  return (
    <form className={`search-bar search-${variant}`} role="search" onSubmit={handleSubmit}>
      <div className="search-field">
        <span className="search-icon" aria-hidden="true">
          <Icon name="search" size={20} />
        </span>
        <label htmlFor={`${id}-q`} className="sr-only">
          Search for vendors or services
        </label>
        <input
          id={`${id}-q`}
          type="search"
          className="search-input"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search for decorators, caterers, entertainers…"
          autoComplete="off"
        />
      </div>

      <span className="search-divider" aria-hidden="true" />

      <div className="search-loc">
        <LocationSelect value={location} onChange={changeLocation} variant="bare" />
      </div>

      <button type="submit" className="btn btn-primary search-submit">
        <Icon name="search" size={18} className="search-submit-icon" />
        <span>Search</span>
      </button>
    </form>
  );
}
