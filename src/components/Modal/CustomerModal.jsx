import { useMemo, useRef, useState } from 'react';
import { LOCATIONS } from '../../data/categories';
import * as api from '../../services/api';
import useAsync from '../../hooks/useAsync';
import Icon from '../common/Icon';
import { DemoTag, Loading } from '../common';
import { categorySlug } from '../../data/vendors';
import { shortDate } from '../../utils/time';
import Modal from './Modal';
import './AdminRecordModal.css';

/**
 * Admin customer record — View and Edit (update spec §16).
 *
 * One dialog serves both: View opens read-only, Edit opens on the form, and
 * saving returns to the read-only view so the operator can see what landed.
 *
 * Only name, email and location are editable. The booking count is derived from
 * the booking list and the account status has its own Enable/Disable control, so
 * neither is writable here — a form that can quietly rewrite a derived number is
 * how two screens end up disagreeing (update spec §25).
 *
 * Everything shown is invented demo data. In production this dialog would read
 * and write through an authorised server endpoint that records who changed what
 * (spec §39).
 */

/** Initials for the avatar, so no invented photograph stands in for a person. */
const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/**
 * Client-side validation only — a real backend must re-validate and authorise.
 * The email test is deliberately loose: anything stricter rejects addresses that
 * are perfectly valid.
 */
function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter the customer’s name.';
  else if (values.name.trim().length > 80) errors.name = 'Keep the name under 80 characters.';

  if (!values.email.trim()) errors.email = 'Enter an email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'That does not look like an email address.';
  }

  if (!values.location) errors.location = 'Choose a city.';
  return errors;
}

export default function CustomerModal({ customer, mode = 'view', onSaved, onClose }) {
  const [record, setRecord] = useState(customer);
  const [editing, setEditing] = useState(mode === 'edit');
  const [values, setValues] = useState({
    name: customer?.name ?? '',
    email: customer?.email ?? '',
    location: customer?.location ?? LOCATIONS[0],
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const errorRef = useRef(null);

  const { data: allBookings, loading: bookingsLoading } = useAsync(api.listAdminBookings);

  const bookings = useMemo(
    () => (allBookings ?? []).filter((row) => row.customerId === record?.id),
    [allBookings, record?.id],
  );

  if (!record) {
    return (
      <Modal title="Customer unavailable" size="sm" onClose={onClose}>
        <p>That customer record could not be found.</p>
      </Modal>
    );
  }

  const set = (field) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setSavedAt(null);
  };

  const startEditing = () => {
    setValues({ name: record.name, email: record.email, location: record.location });
    setErrors({});
    setSavedAt(null);
    setEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.updateCustomer(record.id, values);
      // The endpoint returns the whole list, so the table and this dialog stay
      // in step without a second round trip.
      onSaved?.(data);
      setRecord(data.find((row) => row.id === record.id) ?? record);
      setEditing(false);
      setSavedAt(Date.now());
    } catch {
      setErrors({ form: 'Could not save those details. Please try again.' });
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSaving(false);
    }
  };

  const errorList = Object.entries(errors).filter(([, message]) => Boolean(message));

  const summary = (
    <div className="ar-summary">
      <span className="ar-avatar" aria-hidden="true">
        {initials(record.name)}
      </span>
      <div className="ar-summary-text">
        <p className="ar-name wrap-anywhere">{record.name}</p>
        <p className="ar-sub wrap-anywhere">
          {record.email}
          <span aria-hidden="true"> • </span>
          {record.location}
        </p>
      </div>
    </div>
  );

  /* ----------------------------------------------------------------- edit */

  if (editing) {
    return (
      <Modal
        size="md"
        onClose={onClose}
        title="Edit customer"
        subtitle={record.name}
        labelledBy="customer-edit-title"
      >
        <form onSubmit={handleSubmit} noValidate>
          {summary}

          {errorList.length > 0 && (
            <div className="ar-errors" role="alert" tabIndex={-1} ref={errorRef}>
              <Icon name="info" size={16} />
              <div>
                <strong>Please fix {errorList.length === 1 ? 'this' : 'these'} before saving:</strong>
                <ul>
                  {errorList.map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <h3 className="ar-section-title">Contact details</h3>
          <div className="ar-grid">
            <div className="field field-wide">
              <label htmlFor="cm-name">Full name</label>
              <input
                id="cm-name"
                type="text"
                className="input"
                maxLength={80}
                value={values.name}
                onChange={set('name')}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'cm-name-err' : undefined}
                required
              />
              {errors.name && (
                <p className="field-error" id="cm-name-err">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="cm-email">Email</label>
              <input
                id="cm-email"
                type="email"
                className="input"
                value={values.email}
                onChange={set('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'cm-email-err' : undefined}
                required
              />
              {errors.email && (
                <p className="field-error" id="cm-email-err">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="cm-location">City</label>
              <select
                id="cm-location"
                className="select"
                value={values.location}
                onChange={set('location')}
                aria-invalid={Boolean(errors.location)}
                required
              >
                {LOCATIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="ar-section-title">Not editable here</h3>
          <dl className="ar-facts">
            <div>
              <dt>Bookings</dt>
              <dd>{record.bookings} — counted from the booking list</dd>
            </div>
            <div>
              <dt>Account status</dt>
              <dd>{record.status} — changed with Enable or Disable</dd>
            </div>
          </dl>

          <div className="ar-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setErrors({});
                setEditing(false);
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>

          <p className="ar-note">
            <Icon name="info" size={14} />
            <span>
              Demo edit — saved in this browser only. No email is sent and no real account changes.
            </span>
          </p>
        </form>
      </Modal>
    );
  }

  /* ----------------------------------------------------------------- view */

  return (
    <Modal
      size="md"
      onClose={onClose}
      title="Customer details"
      subtitle={record.name}
      labelledBy="customer-view-title"
    >
      {summary}

      {/* Email and city already read in the summary card above, so they are
          not repeated here. */}
      <dl className="ar-facts">
        <div>
          <dt>Joined</dt>
          <dd>{shortDate(record.joined)}</dd>
        </div>
        <div>
          <dt>Account status</dt>
          <dd>
            <span className={`pill status-${categorySlug(record.status)}`}>{record.status}</span>
          </dd>
        </div>
      </dl>

      {savedAt && (
        <p className="ar-saved" role="status">
          <Icon name="check" size={15} /> Details saved.
        </p>
      )}

      <h3 className="ar-section-title">
        Bookings ({record.bookings}){' '}
        <DemoTag label="Demo bookings" notice="Invented bookings. No vendor was contacted." />
      </h3>

      {bookingsLoading ? (
        <Loading label="Loading bookings…" />
      ) : bookings.length > 0 ? (
        <ul className="ar-bookings">
          {bookings.map((booking) => (
            <li key={booking.id} className="ar-booking">
              <div className="ar-booking-text">
                <p className="ar-booking-vendor wrap-anywhere">{booking.vendorName}</p>
                <p className="ar-booking-meta">
                  {booking.reference}
                  <span aria-hidden="true"> • </span>
                  {booking.eventType}
                  <span aria-hidden="true"> • </span>
                  {shortDate(booking.eventDate)}
                </p>
              </div>
              <span className={`pill status-${categorySlug(booking.status)}`}>{booking.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="ar-empty">
          No bookings on this account yet. They will appear here as soon as one is made.
        </p>
      )}

      <div className="ar-actions">
        <button type="button" className="btn btn-primary" onClick={startEditing}>
          <Icon name="edit" size={15} /> Edit details
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>

      <p className="ar-note">
        <Icon name="info" size={14} />
        <span>
          Invented person, invented bookings. No real customer data is stored in this demo.
        </span>
      </p>
    </Modal>
  );
}
