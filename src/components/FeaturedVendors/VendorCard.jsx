import { useApp } from '../../context/AppContext';
import { categorySlug, experienceLabel, scaleLabel, SAMPLE_NOTICE } from '../../data/vendors';
import Icon from '../common/Icon';
import { DemoTag, SafeImage, Stars } from '../common';
import './VendorCard.css';

/**
 * Vendor card (spec §10 / §11).
 *
 * Fixed-height regions (image, two-line name, three metadata rows, action row)
 * keep every card in a row the same height regardless of content length.
 * Rating and price come from `vendor.demo` and are always shown with a demo tag.
 */
export default function VendorCard({ vendor, eager = false }) {
  const { isWishlisted, toggleWishlist, isComparing, toggleCompare, openModal } = useApp();

  const saved = isWishlisted(vendor.id);
  const comparing = isComparing(vendor.id);
  const scale = scaleLabel(vendor);
  const availability = vendor.demo.availability;

  return (
    <article className="vendor-card">
      <div className="vendor-media">
        <SafeImage
          src={vendor.image}
          alt={`Event work by ${vendor.facts.name}`}
          eager={eager}
          className="vendor-img"
        />

        <button
          type="button"
          className={`vendor-heart ${saved ? 'is-on' : ''}`.trim()}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${vendor.facts.name} from wishlist` : `Save ${vendor.facts.name} to wishlist`}
          onClick={() => toggleWishlist(vendor)}
        >
          <Icon name="heart" size={17} />
        </button>

        <span className={`vendor-pill pill-${categorySlug(vendor.facts.category)}`}>
          {vendor.facts.category}
        </span>

        {/* Says plainly that an invented listing is invented (spec §38). */}
        {vendor.sample && (
          <span className="vendor-sample" title={SAMPLE_NOTICE}>
            Sample listing
            <span className="sr-only"> — {SAMPLE_NOTICE}</span>
          </span>
        )}
      </div>

      <div className="vendor-body">
        <h3 className="vendor-name clamp-2 wrap-anywhere" title={vendor.facts.name}>
          {vendor.facts.name}
        </h3>

        <div className="vendor-rating-row">
          <Stars value={vendor.demo.rating} count={vendor.demo.reviewCount} />
        </div>

        <ul className="vendor-meta">
          <li>
            <Icon name="shield" size={14} />
            <span>{experienceLabel(vendor)} experience</span>
          </li>
          <li>
            <Icon name="ticket" size={14} />
            {/* Never invent a count the source did not supply. */}
            <span>{scale ?? 'Event count not supplied'}</span>
          </li>
          <li>
            <Icon name="pin" size={14} />
            <span className="clamp-1">{vendor.location}</span>
          </li>
        </ul>

        <p className="vendor-specialty clamp-2" title={vendor.facts.specialty}>
          {vendor.facts.specialty}
        </p>

        {availability && (
          <p className={`vendor-availability avail-${categorySlug(availability)}`}>
            <span className="avail-dot" aria-hidden="true" />
            {availability}
            <DemoTag label="Demo" notice="Demo availability — not a live calendar." />
          </p>
        )}
      </div>

      <div className="vendor-actions">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => openModal('vendor', { vendorId: vendor.id })}
        >
          View Profile
        </button>
        <button
          type="button"
          className={`btn btn-secondary btn-sm ${comparing ? 'is-comparing' : ''}`.trim()}
          aria-pressed={comparing}
          onClick={() => toggleCompare(vendor)}
        >
          <Icon name={comparing ? 'check' : 'scale'} size={15} />
          {comparing ? 'Added' : 'Compare'}
        </button>
      </div>
    </article>
  );
}
