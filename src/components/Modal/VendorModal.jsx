import { useApp } from '../../context/AppContext';
import {
  categorySlug,
  experienceLabel,
  getVendorById,
  SAMPLE_NOTICE,
  scaleLabel,
} from '../../data/vendors';
import Icon from '../common/Icon';
import { DemoTag, SafeImage, Stars } from '../common';
import Modal from './Modal';
import './VendorModal.css';

const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

/**
 * Vendor profile (spec §13). Source facts are listed first and unlabelled;
 * every demo value carries a DemoTag so the two are never confused.
 */
export default function VendorModal({ vendorId, onClose }) {
  const { isWishlisted, toggleWishlist, isComparing, toggleCompare, openModal } = useApp();
  const vendor = getVendorById(vendorId);

  if (!vendor) {
    return (
      <Modal title="Vendor unavailable" size="sm" onClose={onClose}>
        <p>We could not find that vendor. It may have been removed.</p>
      </Modal>
    );
  }

  const saved = isWishlisted(vendor.id);
  const comparing = isComparing(vendor.id);
  const scale = scaleLabel(vendor);
  const { demo } = vendor;

  return (
    <Modal size="lg" onClose={onClose} labelledBy="vendor-modal-title">
      <div className="vm">
        <div className="vm-hero">
          <SafeImage src={vendor.image} alt={`Event work by ${vendor.facts.name}`} eager className="vm-hero-img" />
          {/* categorySlug keeps multi-word categories from becoming two class names. */}
          <span className={`vendor-pill pill-${categorySlug(vendor.facts.category)} vm-pill`}>
            {vendor.facts.category}
          </span>
        </div>

        <div className="vm-head">
          <div className="vm-head-text">
            <h2 id="vendor-modal-title" className="vm-name wrap-anywhere">
              {vendor.facts.name}
            </h2>
            <p className="vm-sub">
              <Icon name="pin" size={15} /> {vendor.location}
              <span className="vm-dot" aria-hidden="true">•</span>
              {vendor.facts.category}
              {/* An invented listing says so plainly (spec §38). */}
              {vendor.sample && (
                <>
                  <span className="vm-dot" aria-hidden="true">•</span>
                  <span className="vm-sample" title={SAMPLE_NOTICE}>
                    Sample listing
                    <span className="sr-only"> — {SAMPLE_NOTICE}</span>
                  </span>
                </>
              )}
            </p>
            <div className="vm-rating">
              <Stars value={demo.rating} count={demo.reviewCount} />
              {demo.verified ? (
                <span className="pill vm-verified">
                  <Icon name="checkCircle" size={13} /> Verified <DemoTag label="Demo" notice="Verification badge is placeholder UI — no verification has been performed." />
                </span>
              ) : (
                <span className="pill vm-unverified">
                  <Icon name="info" size={13} /> Not verified
                </span>
              )}
            </div>

            {demo.availability && (
              <p className={`vendor-availability avail-${categorySlug(demo.availability)}`}>
                <span className="avail-dot" aria-hidden="true" />
                {demo.availability}
                <DemoTag label="Demo" notice="Demo availability — not a live calendar." />
              </p>
            )}
          </div>

          <button
            type="button"
            className={`icon-btn vm-heart ${saved ? 'is-on' : ''}`.trim()}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            onClick={() => toggleWishlist(vendor)}
          >
            <Icon name="heart" size={19} />
          </button>
        </div>

        {/*
         * For the nine supplied vendors this sentence is built from their own
         * facts, so it makes no claim the source document did not (spec §38).
         * Sample vendors are invented, and the label above says so.
         */}
        <p className="vm-about">{demo.description}</p>

        {/* ------------------------------------------- source facts */}
        <ul className="vm-facts">
          <li>
            <span className="vm-fact-label">Experience</span>
            <span className="vm-fact-value">{experienceLabel(vendor)}</span>
          </li>
          <li>
            <span className="vm-fact-label">Events / scale</span>
            <span className="vm-fact-value">{scale ?? 'Not supplied'}</span>
          </li>
          <li>
            <span className="vm-fact-label">Specialty</span>
            <span className="vm-fact-value">{vendor.facts.specialty}</span>
          </li>
          <li>
            <span className="vm-fact-label">
              Starting price <DemoTag notice="Demo price — not confirmed vendor pricing." />
            </span>
            <span className="vm-fact-value">
              {demo.startingPrice ? `${inr(demo.startingPrice)} / ${demo.priceUnit}` : 'On request'}
            </span>
          </li>
        </ul>

        <section className="vm-section">
          <h3 className="vm-section-title">
            Services <DemoTag notice="Illustrative service list for the demo." />
          </h3>
          <ul className="vm-chips">
            {demo.services.map((service) => (
              <li key={service} className="pill vm-chip">
                <Icon name="check" size={13} /> {service}
              </li>
            ))}
          </ul>
        </section>

        <section className="vm-section">
          <h3 className="vm-section-title">
            Portfolio <DemoTag notice="Stock photography placeholder, not this vendor's work." />
          </h3>
          <ul className="vm-portfolio">
            {demo.portfolioImages.map((src, i) => (
              <li key={src}>
                <SafeImage
                  src={src}
                  alt={`${vendor.facts.category} example ${i + 1} of ${demo.portfolioImages.length}`}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="vm-section">
          <h3 className="vm-section-title">
            Reviews <DemoTag notice="Placeholder reviews — not collected from real customers." />
          </h3>
          <ul className="vm-reviews">
            {demo.reviews.map((review, i) => (
              <li key={`${review.author}-${i}`} className="vm-review">
                <div className="vm-review-head">
                  <span className="vm-review-author">{review.author}</span>
                  <Stars value={review.rating} showTag={false} />
                </div>
                <p className="vm-review-text">{review.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------- actions */}
        <div className="vm-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openModal('booking', { vendorId: vendor.id })}
          >
            <Icon name="calendar" size={16} /> Book Now
          </button>
          <button
            type="button"
            className="btn btn-navy"
            onClick={() => openModal('chat', { vendorId: vendor.id })}
          >
            <Icon name="chat" size={16} /> Message
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${comparing ? 'is-comparing' : ''}`.trim()}
            aria-pressed={comparing}
            onClick={() => toggleCompare(vendor)}
          >
            <Icon name={comparing ? 'check' : 'scale'} size={16} />
            {comparing ? 'In comparison' : 'Compare'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => toggleWishlist(vendor)}>
            <Icon name="heart" size={16} /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
