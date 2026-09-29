import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';
import {
  DEFAULT_LOCATION,
  FILTERABLE_CATEGORIES,
  getCategoryById,
  LOCATIONS,
  SORT_OPTIONS,
  vendorMatchesCategory,
} from '../data/categories';
import Icon from '../components/common/Icon';
import { EmptyState, SkeletonGrid } from '../components/common';
import SearchBar from '../components/SearchBar/SearchBar';
import VendorCard from '../components/FeaturedVendors/VendorCard';
import Decor from '../components/Hero/Decor';
import './pages.css';

/**
 * Vendor discovery (spec §12): search, category, city, sort.
 *
 * `filters` in context is the single source of truth; the URL mirrors it so a
 * filtered view can be shared or reloaded. The controls are the same on both
 * breakpoints — the desktop renders them as a sticky sidebar beside the grid,
 * the phone renders the identical panel inside a drawer — so there is one
 * filter component and one set of handlers, not two.
 */
export default function Vendors() {
  const { vendors, filters, setFilters, resetFilters } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hydrated = useRef(false);

  /* URL → filters, once on mount, so an inbound /vendors?category=… link works. */
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const query = searchParams.get('q') ?? '';
    const categoryId = searchParams.get('category');
    const patch = {};
    if (query) patch.query = query;
    if (categoryId && getCategoryById(categoryId)) patch.categoryId = categoryId;
    if (Object.keys(patch).length > 0) setFilters(patch);
  }, [searchParams, setFilters]);

  /* filters → URL. Replace, so filtering does not fill the back stack. */
  useEffect(() => {
    if (!hydrated.current) return;
    const next = new URLSearchParams();
    if (filters.query) next.set('q', filters.query);
    if (filters.categoryId) next.set('category', filters.categoryId);
    const current = searchParams.toString();
    if (next.toString() !== current) setSearchParams(next, { replace: true });
  }, [filters.query, filters.categoryId, searchParams, setSearchParams]);

  /* filters → results. */
  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .listVendors(filters)
      .then(({ data }) => {
        if (active) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setResults([]);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [filters]);

  /* Escape closes the mobile drawer, and the body locks while it is open. */
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  /*
   * Counts are scoped to the chosen city, not the whole catalogue — a sidebar
   * that promises "Venues 3" and then renders an empty grid because those three
   * are in another city is worse than no count at all.
   */
  const counts = useMemo(() => {
    const inCity = vendors.filter((v) => !filters.location || v.location === filters.location);
    const table = { __all: inCity.length };
    for (const category of FILTERABLE_CATEGORIES) {
      table[category.id] = inCity.filter((v) => vendorMatchesCategory(v, category)).length;
    }
    return table;
  }, [vendors, filters.location]);

  const activeCategory = filters.categoryId ? getCategoryById(filters.categoryId) : null;
  const hasFilters =
    Boolean(filters.query) || Boolean(filters.categoryId) || filters.location !== DEFAULT_LOCATION;

  /* One panel, rendered twice — sidebar on desktop, drawer on phones. The id
     prefix keeps the two copies' labels from colliding. */
  const renderFilters = (idPrefix) => (
    <>
      <div className="filter-group">
        <h3 className="filter-title">Category</h3>
        <ul className="filter-options" role="group" aria-label="Filter by category">
          <li>
            <button
              type="button"
              className={`filter-option ${!filters.categoryId ? 'is-on' : ''}`.trim()}
              aria-pressed={!filters.categoryId}
              onClick={() => setFilters({ categoryId: null })}
            >
              <span className="filter-option-lead">
                <Icon name="grid" size={15} />
                All categories
              </span>
              <span className="filter-count">{counts.__all}</span>
            </button>
          </li>
          {FILTERABLE_CATEGORIES.map((category) => {
            const on = filters.categoryId === category.id;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  className={`filter-option ${on ? 'is-on' : ''}`.trim()}
                  aria-pressed={on}
                  onClick={() => setFilters({ categoryId: on ? null : category.id })}
                >
                  <span className="filter-option-lead">
                    <Icon name={category.icon} size={15} />
                    {category.label}
                  </span>
                  <span className="filter-count">{counts[category.id] ?? 0}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="filter-group">
        <h3 className="filter-title">City</h3>
        <label className="sr-only" htmlFor={`${idPrefix}-city`}>
          Filter by city
        </label>
        <select
          id={`${idPrefix}-city`}
          className="select filter-select"
          value={filters.location}
          onChange={(event) => setFilters({ location: event.target.value })}
        >
          {LOCATIONS.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <h3 className="filter-title">Sort by</h3>
        <label className="sr-only" htmlFor={`${idPrefix}-sort`}>
          Sort vendors
        </label>
        <select
          id={`${idPrefix}-sort`}
          className="select filter-select"
          value={filters.sort}
          onChange={(event) => setFilters({ sort: event.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button type="button" className="btn btn-outline btn-sm filter-clear" onClick={resetFilters}>
          <Icon name="close" size={15} /> Clear all filters
        </button>
      )}
    </>
  );

  return (
    <div className="page vendors-page">
      <header className="page-hero">
        <Decor scope="page" on="light" />
        <div className="container page-hero-inner">
          <h1 className="page-title">
            Find your <span className="accent">vendors</span>
          </h1>
          <p className="page-lede">
            Browse decorators, caterers, entertainers, photographers, venues and more. Compare what
            matters to you, then send a booking request in a couple of taps.
          </p>
          {/* The page variant carries its own location picker, so the toolbar
              below only needs the count and the drawer trigger. */}
          <SearchBar variant="page" onSubmit={(query) => setFilters({ query })} />
        </div>
      </header>

      <div className="container">
        <div className="vendors-layout">
          {/* ------------------------------------------- desktop sidebar */}
          <aside className="filter-panel" aria-label="Vendor filters">
            {renderFilters('side')}
          </aside>

          <div className="vendors-main">
            {/* ----------------------------------------------- toolbar */}
            <div className="toolbar">
              <p className="toolbar-count" aria-live="polite">
                {loading ? (
                  'Searching…'
                ) : (
                  <>
                    <strong>{results.length}</strong>
                    {results.length === 1 ? ' vendor' : ' vendors'}
                    {activeCategory ? ` in ${activeCategory.label}` : ''}
                    {filters.query ? ` for “${filters.query}”` : ''}
                  </>
                )}
              </p>

              <div className="toolbar-controls">
                <button
                  type="button"
                  className="btn btn-outline btn-sm filter-trigger"
                  onClick={() => setDrawerOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={drawerOpen}
                >
                  <Icon name="filter" size={15} /> Filters
                  {activeCategory && <span className="filter-trigger-dot" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* ----------------------------------------------- results */}
            {loading ? (
              <SkeletonGrid count={8} />
            ) : results.length > 0 ? (
              <ul className="vendor-grid">
                {results.map((vendor, i) => (
                  <li key={vendor.id}>
                    <VendorCard vendor={vendor} eager={i < 4} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="search"
                title="No vendors match these filters"
                text={
                  activeCategory
                    ? `No ${activeCategory.label.toLowerCase()} listings in ${filters.location} yet. Try another city, or clear the filters to see every category.`
                    : 'Try a different search term, another city, or clear your filters.'
                }
                actions={
                  <button type="button" className="btn btn-primary" onClick={resetFilters}>
                    Clear filters
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- mobile drawer */}
      <div
        className={`filter-scrim ${drawerOpen ? 'is-open' : ''}`.trim()}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`filter-drawer ${drawerOpen ? 'is-open' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label="Vendor filters"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div className="filter-drawer-head">
          <h2 className="filter-drawer-title">Filters</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close filters"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {renderFilters('drawer')}
        <button
          type="button"
          className="btn btn-primary filter-drawer-done"
          onClick={() => setDrawerOpen(false)}
        >
          Show {results.length} {results.length === 1 ? 'vendor' : 'vendors'}
        </button>
      </div>
    </div>
  );
}
