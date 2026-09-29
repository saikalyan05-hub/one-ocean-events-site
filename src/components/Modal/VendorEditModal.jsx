import { useState } from 'react';
import * as api from '../../services/api';
import Icon from '../common/Icon';
import { SafeImage } from '../common';
import { categorySlug } from '../../data/vendors';
import { relativeTime } from '../../utils/time';
import Modal from './Modal';
import './AdminRecordModal.css';

/**
 * Admin vendor record — Edit (update spec §15).
 *
 * The only field this dialog writes is the listing status, because it is the
 * only vendor field the demo genuinely owns. Name, category, experience, event
 * count and city come from the supplied vendor document and are the source of
 * truth: editing them in the browser would fabricate vendor facts, which spec
 * §38 forbids. They are shown read-only, with a line saying why.
 *
 * Verified is deliberately absent. Marking a listing verified would need an
 * actual verification step behind it (spec §10), so the demo has no control for
 * it at all rather than a control that lies.
 *
 * In production this is an authorised server call with an audit record; the
 * status a browser reports can never be trusted on its own (spec §39).
 */

const STATUSES = [
  { value: 'Active', hint: 'Listed publicly and bookable.' },
  { value: 'Pending', hint: 'Waiting on review — hidden from search.' },
  { value: 'Disabled', hint: 'Taken down. Nothing is deleted.' },
];

export default function VendorEditModal({ vendor, onSaved, onClose }) {
  // `current` is what is stored, `status` is what the radios show. Keeping both
  // is what lets Save disable itself once there is nothing left to save.
  const [current, setCurrent] = useState(vendor?.status ?? 'Active');
  const [status, setStatus] = useState(vendor?.status ?? 'Active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  if (!vendor) {
    return (
      <Modal title="Listing unavailable" size="sm" onClose={onClose}>
        <p>That vendor listing could not be found.</p>
      </Modal>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.setVendorStatus(vendor.id, status);
      // The endpoint returns the whole list, so the table behind this dialog
      // updates from the same response rather than a second round trip.
      onSaved?.(data);
      setCurrent(status);
      setSaved(true);
    } catch {
      setError('Could not save that status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      size="md"
      onClose={onClose}
      title="Edit listing"
      subtitle={vendor.name}
      labelledBy="vendor-edit-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="ar-summary">
          <SafeImage src={vendor.image} alt="" className="ar-thumb" />
          <div className="ar-summary-text">
            <p className="ar-name wrap-anywhere">{vendor.name}</p>
            <p className="ar-sub">
              {vendor.sample ? 'Sample listing' : 'Supplied listing'}
              <span aria-hidden="true"> • </span>
              {vendor.location}
            </p>
          </div>
        </div>

        {error && (
          <p className="ar-errors" role="alert">
            <Icon name="info" size={16} /> {error}
          </p>
        )}

        <h3 className="ar-section-title">Listing details</h3>
        <dl className="ar-facts">
          <div>
            <dt>Category</dt>
            <dd>
              <span className={`pill pill-${categorySlug(vendor.category)}`}>{vendor.category}</span>
            </dd>
          </div>
          <div>
            <dt>Experience</dt>
            <dd>{vendor.experienceLabel}</dd>
          </div>
          <div>
            <dt>Events delivered</dt>
            {/* Never invent a count the source document did not supply. */}
            <dd>{vendor.eventCountLabel ?? 'Not supplied'}</dd>
          </div>
          <div>
            <dt>City</dt>
            <dd>{vendor.location}</dd>
          </div>
          <div>
            <dt>Current status</dt>
            <dd>
              <span className={`pill status-${categorySlug(current)}`}>{current}</span>
            </dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>{vendor.submitted ? relativeTime(vendor.submitted) : 'Not supplied'}</dd>
          </div>
        </dl>

        <p className="ar-note">
          <Icon name="shield" size={14} />
          <span>
            {vendor.sample
              ? 'These details belong to the vendor record, so they are read-only here — a listing is edited by the vendor, then reviewed.'
              : 'These details come from the supplied vendor document and are read-only here. Changing a real business’s facts from an admin screen would misrepresent them.'}
          </span>
        </p>

        <fieldset className="ar-status-choice">
          <legend>Listing status</legend>
          {STATUSES.map((option) => (
            <label key={option.value} className="ar-status-option" title={option.hint}>
              <input
                type="radio"
                name="vendor-status"
                value={option.value}
                checked={status === option.value}
                onChange={() => {
                  setStatus(option.value);
                  setSaved(false);
                }}
              />
              {option.value}
            </label>
          ))}
        </fieldset>
        <p className="field-hint">
          {STATUSES.find((option) => option.value === status)?.hint}
        </p>

        {saved && (
          <p className="ar-saved" role="status">
            <Icon name="check" size={15} /> Status saved as {status}.
          </p>
        )}

        <div className="ar-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || status === current}>
            {saving ? 'Saving…' : 'Save status'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Close
          </button>
        </div>

        <p className="ar-note">
          <Icon name="info" size={14} />
          <span>
            Demo change — saved in this browser only. No vendor is contacted, and no listing is
            marked verified: verification would need real checks first.
          </span>
        </p>
      </form>
    </Modal>
  );
}
