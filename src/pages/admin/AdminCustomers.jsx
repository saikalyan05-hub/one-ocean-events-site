import { useMemo, useState } from 'react';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import { useApp } from '../../context/AppContext';
import Icon from '../../components/common/Icon';
import { DemoTag, EmptyState, Loading } from '../../components/common';
import useAsync from '../../hooks/useAsync';
import * as api from '../../services/api';
import { categorySlug } from '../../data/vendors';
import { shortDate } from '../../utils/time';

/**
 * Customer management (update spec §16).
 *
 * Every person listed here is invented. Disabling a customer writes a status
 * override into this browser; in production it would be an authorised server
 * call with an audit log entry (spec §39).
 */
export default function AdminCustomers() {
  const { openModal } = useApp();
  const { data, loading, setData } = useAsync(api.listAdminCustomers);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const rows = useMemo(() => {
    const list = data ?? [];
    const needle = query.trim().toLowerCase();
    return list.filter((customer) => {
      if (status !== 'All' && customer.status !== status) return false;
      if (!needle) return true;
      return `${customer.name} ${customer.email} ${customer.location}`
        .toLowerCase()
        .includes(needle);
    });
  }, [data, query, status]);

  const setCustomerStatus = async (id, next) => {
    const result = await api.setCustomerStatus(id, next);
    setData(result.data);
  };

  /* The dialog saves through api.js and hands back the fresh list, so the table
     updates from the same response rather than refetching. */
  const openRecord = (customer, mode) =>
    openModal('customer', { customer, mode, onSaved: setData });

  if (loading || !data) return <Loading label="Loading customers…" />;

  return (
    <>
      <DashHead title="Customers" lede="Everyone using the demo marketplace.">
        <p className="dash-lede">
          <DemoTag label="Demo customers" notice="Invented people. No real customer data here." />
        </p>
      </DashHead>

      <div className="dash-toolbar">
        <div className="dash-search">
          <Icon name="search" size={17} />
          <label className="sr-only" htmlFor="admin-customer-search">
            Search customers
          </label>
          <input
            id="admin-customer-search"
            type="search"
            placeholder="Search by name, email or city"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <label className="sr-only" htmlFor="admin-customer-status">
          Filter by status
        </label>
        <select
          id="admin-customer-status"
          className="dash-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {['All', 'Active', 'Disabled'].map((option) => (
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
            <caption className="sr-only">Demo customer accounts</caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Location</th>
                <th scope="col">Bookings</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <span className="cell-strong wrap-anywhere">{customer.name}</span>
                    <span className="cell-sub">Joined {shortDate(customer.joined)}</span>
                  </td>
                  <td className="wrap-anywhere">{customer.email}</td>
                  <td>{customer.location}</td>
                  <td>{customer.bookings}</td>
                  <td>
                    <span className={`pill status-${categorySlug(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => openRecord(customer, 'view')}
                      >
                        <Icon name="eye" size={14} /> View
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => openRecord(customer, 'edit')}
                      >
                        <Icon name="edit" size={14} /> Edit
                      </button>
                      {customer.status === 'Disabled' ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setCustomerStatus(customer.id, 'Active')}
                        >
                          <Icon name="check" size={14} /> Enable
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setCustomerStatus(customer.id, 'Disabled')}
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
          icon="users"
          title="No customers match that search"
          text="Try a different name, email or city."
          actions={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setQuery('');
                setStatus('All');
              }}
            >
              Clear search
            </button>
          }
        />
      )}

      <p className="page-note">
        <Icon name="info" size={15} />
        <span>
          Every person listed here is invented. Detail and status changes are saved in this browser
          only — no account is touched and no email is sent.
        </span>
      </p>
    </>
  );
}
