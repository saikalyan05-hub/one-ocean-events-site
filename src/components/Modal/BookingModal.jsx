import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getVendorById } from '../../data/vendors';
import { EVENT_TYPES, LOCATIONS } from '../../data/categories';
import Icon from '../common/Icon';
import { DemoTag, SafeImage } from '../common';
import Modal from './Modal';
import './BookingModal.css';

const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

/** Local date in YYYY-MM-DD, so "today" matches the user's calendar, not UTC. */
function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Client-side validation only. A production backend must re-validate every
 * field and authorise the request before persisting it — the browser is not a
 * trust boundary.
 */
function validate(values) {
  const errors = {};
  if (!values.eventDate) errors.eventDate = 'Choose your event date.';
  else if (values.eventDate < todayISO()) errors.eventDate = 'Pick a date that is today or later.';

  if (!values.eventType) errors.eventType = 'Select an event type.';
  if (!values.location) errors.location = 'Select a location.';

  const guests = Number(values.guestCount);
  if (!values.guestCount) errors.guestCount = 'Enter an approximate guest count.';
  else if (!Number.isFinite(guests) || guests < 1) errors.guestCount = 'Guest count must be at least 1.';
  else if (guests > 10000) errors.guestCount = 'For more than 10,000 guests, please use chat.';

  if (values.notes.length > 500) errors.notes = 'Please keep notes under 500 characters.';
  return errors;
}

export default function BookingModal({ vendorId, onClose }) {
  const { createBooking, location: appLocation, closeAllModals } = useApp();
  const vendor = getVendorById(vendorId);

  const [values, setValues] = useState({
    eventDate: '',
    eventType: '',
    location: appLocation,
    guestCount: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const errorRef = useRef(null);

  const estimate = useMemo(() => {
    if (!vendor?.demo.startingPrice) return null;
    const guests = Number(values.guestCount);
    if (vendor.demo.priceUnit === 'plate') {
      return Number.isFinite(guests) && guests > 0 ? vendor.demo.startingPrice * guests : null;
    }
    return vendor.demo.startingPrice;
  }, [vendor, values.guestCount]);

  if (!vendor) {
    return (
      <Modal title="Vendor unavailable" size="sm" onClose={onClose}>
        <p>We could not find that vendor, so there is nothing to book.</p>
      </Modal>
    );
  }

  const set = (field) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the summary so screen readers announce what failed.
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setSubmitting(true);
    try {
      const booking = await createBooking({ vendorId: vendor.id, ...values });
      setConfirmed(booking);
    } catch {
      setErrors({ form: 'Something went wrong sending your request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------------------------------- confirmation */

  if (confirmed) {
    return (
      <Modal size="sm" onClose={onClose} labelledBy="booking-done-title">
        <div className="bk-done">
          <span className="bk-done-icon" aria-hidden="true">
            <Icon name="checkCircle" size={34} />
          </span>
          <h2 id="booking-done-title" className="bk-done-title">
            Request sent
          </h2>
          <p className="bk-done-text">
            {vendor.facts.name} has your enquiry. You can track it under My Bookings.
          </p>
          <p className="bk-reference">
            Reference <strong>{confirmed.reference}</strong>
          </p>
          <div className="bk-done-actions">
            <Link to="/bookings" className="btn btn-primary" onClick={closeAllModals}>
              View My Bookings
            </Link>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Keep browsing
            </button>
          </div>
          <p className="bk-note">
            <Icon name="info" size={14} /> Demo booking — stored in this browser only. Nothing was
            sent to the vendor.
          </p>
        </div>
      </Modal>
    );
  }

  /* ----------------------------------------------------------------- form */

  const errorList = Object.entries(errors).filter(([, message]) => Boolean(message));

  return (
    <Modal
      size="md"
      onClose={onClose}
      title="Request a booking"
      subtitle={vendor.facts.name}
      labelledBy="booking-title"
    >
      <form className="bk" onSubmit={handleSubmit} noValidate>
        <div className="bk-vendor">
          <SafeImage src={vendor.image} alt="" className="bk-vendor-img" />
          <div className="bk-vendor-text">
            <p className="bk-vendor-name wrap-anywhere">{vendor.facts.name}</p>
            <p className="bk-vendor-meta">
              {vendor.facts.category}
              <span aria-hidden="true"> • </span>
              {vendor.location}
            </p>
          </div>
        </div>

        {errorList.length > 0 && (
          <div className="bk-errors" role="alert" tabIndex={-1} ref={errorRef}>
            <Icon name="info" size={16} />
            <div>
              <strong>Please fix {errorList.length === 1 ? 'this' : 'these'} before sending:</strong>
              <ul>
                {errorList.map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="bk-grid">
          <div className="field">
            <label htmlFor="bk-date">Event date</label>
            <input
              id="bk-date"
              type="date"
              className="input"
              min={todayISO()}
              value={values.eventDate}
              onChange={set('eventDate')}
              aria-invalid={Boolean(errors.eventDate)}
              aria-describedby={errors.eventDate ? 'bk-date-err' : undefined}
              required
            />
            {errors.eventDate && (
              <p className="field-error" id="bk-date-err">
                {errors.eventDate}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="bk-type">Event type</label>
            <select
              id="bk-type"
              className="select"
              value={values.eventType}
              onChange={set('eventType')}
              aria-invalid={Boolean(errors.eventType)}
              aria-describedby={errors.eventType ? 'bk-type-err' : undefined}
              required
            >
              <option value="">Select an event type</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.eventType && (
              <p className="field-error" id="bk-type-err">
                {errors.eventType}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="bk-location">Location</label>
            <select
              id="bk-location"
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

          <div className="field">
            <label htmlFor="bk-guests">Approximate guests</label>
            <input
              id="bk-guests"
              type="number"
              inputMode="numeric"
              className="input"
              min="1"
              max="10000"
              placeholder="e.g. 250"
              value={values.guestCount}
              onChange={set('guestCount')}
              aria-invalid={Boolean(errors.guestCount)}
              aria-describedby={errors.guestCount ? 'bk-guests-err' : undefined}
              required
            />
            {errors.guestCount && (
              <p className="field-error" id="bk-guests-err">
                {errors.guestCount}
              </p>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="bk-notes">
            Anything else? <span className="field-optional">Optional</span>
          </label>
          <textarea
            id="bk-notes"
            className="textarea"
            rows={3}
            maxLength={500}
            placeholder="Theme, colours, venue, timings…"
            value={values.notes}
            onChange={set('notes')}
            aria-invalid={Boolean(errors.notes)}
          />
          <p className="field-hint">{values.notes.length}/500</p>
        </div>

        <div className="bk-estimate">
          <div className="bk-estimate-row">
            <span className="bk-estimate-label">
              Indicative total{' '}
              <DemoTag notice="Demo estimate from placeholder pricing — not a quote." />
            </span>
            <span className="bk-estimate-value">
              {estimate ? inr(estimate) : 'Vendor will share a quote'}
            </span>
          </div>
          {vendor.demo.startingPrice ? (
            <p className="bk-estimate-basis">
              Based on {inr(vendor.demo.startingPrice)} per {vendor.demo.priceUnit}
              {vendor.demo.priceUnit === 'plate' && Number(values.guestCount) > 0
                ? ` × ${Number(values.guestCount).toLocaleString('en-IN')} guests`
                : ''}
            </p>
          ) : null}
        </div>

        <div className="bk-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send booking request'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
        </div>

        <p className="bk-note">
          <Icon name="info" size={14} /> Demo flow — your request is saved in this browser and never
          leaves your device.
        </p>
      </form>
    </Modal>
  );
}
