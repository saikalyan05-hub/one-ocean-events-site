import { useEffect, useMemo, useRef, useState } from 'react';
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

/** Long form for the review step — the raw ISO value is not a date to a reader. */
function prettyDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

/*
 * The six steps of the booking flow (spec §24).
 *
 * `fields` is the only thing that makes a step a step: the gate on "Continue"
 * runs the same `validate()` as the final submit and keeps just the keys the
 * current step owns. That way a rule can never drift between the step gate and
 * the submit — there is one validator, filtered two ways — and `values` stays
 * a single flat object, so `createBooking` receives exactly the payload it
 * received when this was one long form. Nothing below the UI changed.
 */
const STEPS = [
  { id: 'vendor', label: 'Vendor', title: 'Who you are booking', fields: [] },
  { id: 'date', label: 'Date', title: 'When is your event?', fields: ['eventDate'] },
  { id: 'type', label: 'Event', title: 'What are you planning?', fields: ['eventType'] },
  { id: 'location', label: 'Location', title: 'Where is it happening?', fields: ['location'] },
  { id: 'guests', label: 'Guests', title: 'How many guests?', fields: ['guestCount', 'notes'] },
  { id: 'review', label: 'Review', title: 'Review your request', fields: [] },
];

const LAST = STEPS.length - 1;

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
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const errorRef = useRef(null);
  const headingRef = useRef(null);

  const estimate = useMemo(() => {
    if (!vendor?.demo.startingPrice) return null;
    const guests = Number(values.guestCount);
    if (vendor.demo.priceUnit === 'plate') {
      return Number.isFinite(guests) && guests > 0 ? vendor.demo.startingPrice * guests : null;
    }
    return vendor.demo.startingPrice;
  }, [vendor, values.guestCount]);

  /* Announce each step to a screen reader and put focus at the top of the new
     panel, rather than leaving it on a Continue button that just moved. */
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

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

  /** The subset of `validate()` that belongs to one step. */
  const errorsForStep = (index, found = validate(values)) =>
    Object.fromEntries(STEPS[index].fields.filter((f) => found[f]).map((f) => [f, found[f]]));

  const showErrors = (found) => {
    setErrors(found);
    // Move focus to the summary so screen readers announce what failed.
    requestAnimationFrame(() => errorRef.current?.focus());
  };

  const goNext = () => {
    const found = errorsForStep(step);
    if (Object.keys(found).length > 0) return showErrors(found);
    setErrors({});
    setStep((prev) => Math.min(prev + 1, LAST));
  };

  const goBack = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 0));
  };

  /** The stepper only walks back — forward movement has to pass the gate. */
  const goTo = (index) => {
    if (index >= step) return;
    setErrors({});
    setStep(index);
  };

  const send = async () => {
    /* Re-run the whole validator, not just this step's slice: someone who
       stepped back and cleared a field would otherwise submit it empty. */
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      const broken = STEPS.findIndex((s) => s.fields.some((f) => found[f]));
      if (broken >= 0) setStep(broken);
      return showErrors(found);
    }
    setSubmitting(true);
    try {
      const booking = await createBooking({ vendorId: vendor.id, ...values });
      setConfirmed(booking);
    } catch {
      showErrors({ form: 'Something went wrong sending your request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* One submit handler for the whole flow, so Enter in a text field does the
     obvious thing at every step instead of firing the request from step 2. */
  const handleSubmit = (event) => {
    event.preventDefault();
    if (step === LAST) send();
    else goNext();
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
  const current = STEPS[step];
  const review = [
    { label: 'Event date', value: prettyDate(values.eventDate), step: 1 },
    { label: 'Event type', value: values.eventType, step: 2 },
    { label: 'Location', value: values.location, step: 3 },
    {
      label: 'Approximate guests',
      value: values.guestCount ? Number(values.guestCount).toLocaleString('en-IN') : '',
      step: 4,
    },
    { label: 'Notes', value: values.notes.trim() || 'None', step: 4 },
  ];

  return (
    <Modal
      size="md"
      onClose={onClose}
      title="Request a booking"
      subtitle={vendor.facts.name}
      labelledBy="booking-title"
    >
      <form className="bk" onSubmit={handleSubmit} noValidate>
        {/* --------------------------------------------- progress indicator */}
        <div className="bk-progress">
          <p className="bk-progress-count">
            Step <strong>{step + 1}</strong> of {STEPS.length}
          </p>

          {/*
           * The rail is decorative — the list below carries the same state
           * semantically — so it is hidden from assistive tech rather than
           * announced twice.
           */}
          <div className="bk-rail" aria-hidden="true">
            <span className="bk-rail-fill" style={{ width: `${(step / LAST) * 100}%` }} />
          </div>

          <ol className="bk-steps">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                className={`bk-step${i === step ? ' is-on' : ''}${i < step ? ' is-done' : ''}`}
              >
                <button
                  type="button"
                  className="bk-step-btn"
                  onClick={() => goTo(i)}
                  /* Forward steps are unreachable until the gate passes, so
                     they are disabled rather than silently inert. */
                  disabled={i >= step}
                  aria-current={i === step ? 'step' : undefined}
                  aria-label={`Step ${i + 1} of ${STEPS.length}: ${s.label}${
                    i < step ? ' (completed, select to edit)' : ''
                  }`}
                >
                  <span className="bk-step-dot" aria-hidden="true">
                    {i < step ? <Icon name="check" size={12} /> : i + 1}
                  </span>
                  <span className="bk-step-label" aria-hidden="true">
                    {s.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <h3 className="bk-step-title" ref={headingRef} tabIndex={-1}>
          {current.title}
        </h3>

        {errorList.length > 0 && (
          <div className="bk-errors" role="alert" tabIndex={-1} ref={errorRef}>
            <Icon name="info" size={16} />
            <div>
              <strong>Please fix {errorList.length === 1 ? 'this' : 'these'} before continuing:</strong>
              <ul>
                {errorList.map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ 1. vendor */}
        {current.id === 'vendor' && (
          <div className="bk-panel">
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
            <p className="bk-lede">
              Five short steps and your enquiry is on its way. {vendor.facts.name} replies with
              availability and a quote — nothing is charged and nothing is committed here.
            </p>
          </div>
        )}

        {/* -------------------------------------------------------- 2. date */}
        {current.id === 'date' && (
          <div className="bk-panel">
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
                aria-describedby={errors.eventDate ? 'bk-date-err' : 'bk-date-hint'}
                required
              />
              {errors.eventDate ? (
                <p className="field-error" id="bk-date-err">
                  {errors.eventDate}
                </p>
              ) : (
                <p className="field-hint" id="bk-date-hint">
                  Not fixed yet? Pick your closest guess — you can change it when the vendor replies.
                </p>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------- 3. event type */}
        {current.id === 'type' && (
          <div className="bk-panel">
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
          </div>
        )}

        {/* ---------------------------------------------------- 4. location */}
        {current.id === 'location' && (
          <div className="bk-panel">
            <div className="field">
              <label htmlFor="bk-location">Location</label>
              <select
                id="bk-location"
                className="select"
                value={values.location}
                onChange={set('location')}
                aria-invalid={Boolean(errors.location)}
                aria-describedby="bk-location-hint"
                required
              >
                {LOCATIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <p className="field-hint" id="bk-location-hint">
                {vendor.facts.name} is based in {vendor.location}.
              </p>
            </div>
          </div>
        )}

        {/* --------------------------------------------- 5. guests & notes */}
        {current.id === 'guests' && (
          <div className="bk-panel">
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
          </div>
        )}

        {/* ------------------------------------------------------ 6. review */}
        {current.id === 'review' && (
          <div className="bk-panel">
            <dl className="bk-review">
              {review.map((row) => (
                <div className="bk-review-row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd className="wrap-anywhere">{row.value}</dd>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm bk-review-edit"
                    onClick={() => goTo(row.step)}
                  >
                    <Icon name="edit" size={13} /> Edit
                    <span className="sr-only"> {row.label.toLowerCase()}</span>
                  </button>
                </div>
              ))}
            </dl>

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
          </div>
        )}

        {/* ----------------------------------------------------- navigation */}
        <div className="bk-actions">
          {step > 0 ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goBack}
              disabled={submitting}
            >
              <Icon name="arrowLeft" size={15} /> Back
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}

          {step === LAST ? (
            <button
              type="submit"
              className={`btn btn-primary${submitting ? ' btn-loading' : ''}`}
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send booking request'}
            </button>
          ) : (
            <button type="submit" className="btn btn-primary">
              Continue <Icon name="arrowRight" size={15} />
            </button>
          )}
        </div>

        <p className="bk-note">
          <Icon name="info" size={14} /> Demo flow — your request is saved in this browser and never
          leaves your device.
        </p>
      </form>
    </Modal>
  );
}
