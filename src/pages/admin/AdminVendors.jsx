import { useMemo, useState } from 'react';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import { useApp } from '../../context/AppContext';
import Icon from '../../components/common/Icon';
import { EmptyState, Loading, SafeImage } from '../../components/common';
import useAsync from '../../hooks/useAsync';
import * as api from '../../services/api';
import { categorySlug, VENDOR_CATEGORIES } from '../../data/vendors';
import { relativeTime } from '../../utils/time';

/**
 * Vendor management (update spec §15).
 *
 * The table reads the same vendor records the public site renders, so a name,
 * category or experience figure can never differ between the two. Approve and
 * Disable write a status override into this browser; nothing is emailed and no
 * vendor is told anything.
 *
 * Source listings and sample listings are labelled differently on purpose: the
 * nine supplied vendors are real businesses named in the source document, and
 * the rest are invented for the demo (spec §38).
 */
export default function AdminVendors() {
  const { openModal } = useApp();
  const { data, loading, setData } = useAsync(api.listAdminVendors);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  const rows = useMemo(() => {
    const list = data ?? [];
    const needle = query.trim().toLowerCase();
    return list.filter((vendor) => {
      if (category !== 'All' && vendor.category !== category) return false;
      if (status !== 'All' && vendor.status !== status) return false;
      if (!needle) return true;
      return `${vendor.name} ${vendor.category} ${vendor.location}`.toLowerCase().includes(needle);
    });
  }, [data, query, category, status]);

  const setVendorStatus = async (id, next) => {
    const result = await api.setVendorStatus(id, next);
    setData(result.data);
  };

  if (loading || !data) return <Loading label="Loading vendors…" />;

  return (
    <>
      <DashHead title="Vendors" lede="Every listing on the marketplace, with its approval state." />

      <div className="dash-toolbar">
        <div className="dash-search">
          <Icon name="search" size={17} />
          <label className="sr-only" htmlFor="admin-vendor-search">
            Search vendors
          </label>
          <input
            id="admin-vendor-search"
            type="search"
            placeholder="Search by name, category or city"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <label className="sr-only" htmlFor="admin-vendor-category">
          Filter by category
        </label>
        <select
          id="admin-vendor-category"
          className="dash-select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="All">All categories</option>
          {VENDOR_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="admin-vendor-status">
          Filter by status
        </label>
        <select
          id="admin-vendor-status"
          className="dash-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {['All', 'Active', 'Pending', 'Disabled'].map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All statuses' : option}
            </option>
          ))}
        </select>
        <p className="dash-count">
          {rows.length} of {data.length}
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <caption className="sr-only">Vendor listings and their approval status</caption>
            <thead>
              <tr>
                <th scope="col">Vendor</th>
                <th scope="col">Category</th>
                <th scope="col">Experience</th>
                <th scope="col">Events</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((vendor) => (
                <tr key={vendor.id}>
                  <td>
                    <span className="cell-name">
                      <SafeImage src={vendor.image} alt="" className="cell-thumb" />
                      <span style={{ minWidth: 0 }}>
                        <span className="cell-strong wrap-anywhere">{vendor.name}</span>
                        <span className="cell-sub">
                          {vendor.sample ? 'Sample listing' : 'Supplied listing'} ·{' '}
                          {vendor.location}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className={`pill pill-${categorySlug(vendor.category)}`}>
                      {vendor.category}
                    </span>
                  </td>
                  <td>{vendor.experienceLabel}</td>
                  {/* Never invent a count the source did not supply. */}
                  <td>{vendor.eventCountLabel ?? 'Not supplied'}</td>
                  <td>
                    <span className={`pill status-${categorySlug(vendor.status)}`}>
                      {vendor.status}
                    </span>
                    {vendor.submitted && vendor.status === 'Pending' && (
                      <span className="cell-sub">Submitted {relativeTime(vendor.submitted)}</span>
                    )}
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => openModal('vendor', { vendorId: vendor.id })}
                      >
                        <Icon name="eye" size={14} /> View
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          openModal('vendorEdit', { vendor, onSaved: setData })
                        }
                      >
                        <Icon name="edit" size={14} /> Edit
                      </button>
                      {vendor.status !== 'Active' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setVendorStatus(vendor.id, 'Active')}
                        >
                          <Icon name="check" size={14} /> Approve
                        </button>
                      )}
                      {vendor.status !== 'Disabled' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setVendorStatus(vendor.id, 'Disabled')}
                        >
                          <Icon name="ban" size={14} /> Disable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="store"
          title="No vendors match these filters"
          text="Try another category or clear the search."
          actions={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setQuery('');
                setCategory('All');
                setStatus('All');
              }}
            >
              Clear filters
            </button>
          }
        />
      )}

      <p className="page-note">
        <Icon name="info" size={15} />
        <span>
          Edit changes a listing&rsquo;s status only; the vendor facts behind it are the source of
          truth and stay read-only. Approving or disabling is saved in this browser only. No vendor
          is contacted, and no listing is marked verified &mdash; verification would need real
          checks first.
        </span>
      </p>
    </>
  );
}
