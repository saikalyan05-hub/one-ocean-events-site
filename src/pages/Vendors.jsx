import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';
import {
  DEFAULT_LOCATION,
  FILTERABLE_CATEGORIES,
  getCategoryById,
  SORT_OPTIONS,
} from '../data/categories';
import Icon from '../components/common/Icon';
import { EmptyState, SkeletonGrid } from '../components/common';
import SearchBar from '../components/SearchBar/SearchBar';
import VendorCard from '../components/FeaturedVendors/VendorCard';
import Decor from '../components/Hero/Decor';
import './pages.css';

/**
 * Vendor discovery (spec §12): search, category chips, location, sort.
 *
 * `filters` in context is the single source of truth; the URL mirrors it so a
 * filtered view can be shared or reloaded.
 */
export default function Vendors() {
  const { filters, setFilters, resetFilters } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const activeCategory = filters.categoryId ? getCategoryById(filters.categoryId) : null;
  const hasFilters =
    Boolean(filters.query) || Boolean(filters.categoryId) || filters.location !== DEFAULT_LOCATION;

  return (
    <div className="page vendors-page">
      <header className="page-hero">
        <Decor scope="page" />
        <div className="container page-hero-inner">
          <h1 className="page-title">
            Find your <span className="accent">vendors</span>
          </h1>
          <p className="page-lede">
            Browse decorators, caterers, entertainers, photographers, venues and more. Compare what
            matters to you, then send a booking request in a couple of taps.
          </p>
          {/* The page variant carries its own location picker, so the toolbar
              below only needs sort and the clear control. */}
          <SearchBar variant="page" onSubmit={(query) => setFilters({ query })} />
        </div>
      </header>

      <div className="container">
        {/* ------------------------------------------------- category chips */}
        <div className="chip-row" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`chip ${!filters.categoryId ? 'is-on' : ''}`.trim()}
            aria-pressed={!filters.categoryId}
            onClick={() => setFilters({ categoryId: null })}
          >
            All
          </button>
          {FILTERABLE_CATEGORIES.map((category) => {
            const on = filters.categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                className={`chip ${on ? 'is-on' : ''}`.trim()}
                aria-pressed={on}
                onClick={() => setFilters({ categoryId: on ? null : category.id })}
              >
                <Icon name={category.icon} size={15} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------- toolbar */}
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
            <div className="toolbar-sort">
              <label htmlFor="vendors-sort" className="sr-only">
                Sort vendors
              </label>
              <select
                id="vendors-sort"
                className="select"
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
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
                <Icon name="close" size={15} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------- results */}
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
  );
}
