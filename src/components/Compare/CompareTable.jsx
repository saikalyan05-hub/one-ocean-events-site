import { useApp } from '../../context/AppContext';
import { experienceLabel, scaleLabel } from '../../data/vendors';
import Icon from '../common/Icon';
import { DemoTag, SafeImage, Stars } from '../common';
import './CompareTable.css';

/**
 * The side-by-side comparison table (spec §12, update spec §10).
 *
 * Shared on purpose: the compare modal and the dashboard's Compare screen both
 * render this one table rather than two that drift apart (update spec §1).
 *
 * Rows are split into two blocks — source facts first, then demo values, each
 * demo row carrying its own tag so the distinction survives a screenshot.
 */

const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

const FACT_ROWS = [
  { key: 'category', label: 'Category', get: (v) => v.facts.category },
  { key: 'location', label: 'Location', get: (v) => v.location },
  { key: 'experience', label: 'Experience', get: (v) => experienceLabel(v) },
  { key: 'scale', label: 'Events / scale', get: (v) => scaleLabel(v) ?? 'Not supplied' },
  { key: 'specialty', label: 'Specialty', get: (v) => v.facts.specialty },
];

const DEMO_ROWS = [
  {
    key: 'rating',
    label: 'Rating',
    notice: 'Placeholder rating — no reviews have been collected.',
    render: (v) => <Stars value={v.demo.rating} count={v.demo.reviewCount} showTag={false} />,
  },
  {
    key: 'price',
    label: 'Starting price',
    notice: 'Demo price — not confirmed vendor pricing.',
    render: (v) =>
      v.demo.startingPrice ? `${inr(v.demo.startingPrice)} / ${v.demo.priceUnit}` : 'On request',
  },
  {
    key: 'availability',
    label: 'Availability',
    notice: 'Demo availability — not a live calendar.',
    render: (v) => v.demo.availability ?? 'Ask the vendor',
  },
  {
    key: 'verified',
    label: 'Verified',
    notice: 'Verification badge is placeholder UI — no verification has been performed.',
    render: (v) =>
      v.demo.verified ? (
        <span className="cmp-yes">
          <Icon name="checkCircle" size={15} /> Yes
        </span>
      ) : (
        <span className="cmp-no">No</span>
      ),
  },
  {
    key: 'services',
    label: 'Services',
    notice: 'Illustrative service list for the demo.',
    render: (v) => (
      <ul className="cmp-services">
        {v.demo.services.map((service) => (
          <li key={service}>
            <Icon name="check" size={12} /> {service}
          </li>
        ))}
      </ul>
    ),
  },
];

export default function CompareTable({ flush = false }) {
  const { compareVendors, toggleCompare, openModal } = useApp();

  return (
    <div className={`cmp-scroll ${flush ? 'cmp-flush' : ''}`.trim()}>
      <table className="cmp-table">
        <caption className="sr-only">
          Comparison of {compareVendors.length} selected vendors
        </caption>
        <thead>
          <tr>
            <th scope="col" className="cmp-corner">
              <span className="sr-only">Attribute</span>
            </th>
            {compareVendors.map((vendor) => (
              <th scope="col" key={vendor.id} className="cmp-vendor-head">
                <div className="cmp-card">
                  <SafeImage src={vendor.image} alt="" className="cmp-img" />
                  <span className="cmp-name wrap-anywhere">{vendor.facts.name}</span>
                  <button
                    type="button"
                    className="cmp-remove"
                    onClick={() => toggleCompare(vendor)}
                  >
                    <Icon name="close" size={13} />
                    Remove
                    <span className="sr-only"> {vendor.facts.name} from comparison</span>
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className="cmp-band">
            <th scope="rowgroup" colSpan={compareVendors.length + 1}>
              Vendor details
            </th>
          </tr>
          {FACT_ROWS.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.label}</th>
              {compareVendors.map((vendor) => (
                <td key={vendor.id}>{row.get(vendor)}</td>
              ))}
            </tr>
          ))}

          <tr className="cmp-band">
            <th scope="rowgroup" colSpan={compareVendors.length + 1}>
              Demo values <DemoTag label="Placeholder" notice="Everything below is demo data." />
            </th>
          </tr>
          {DEMO_ROWS.map((row) => (
            <tr key={row.key}>
              <th scope="row">
                {row.label} <DemoTag notice={row.notice} />
              </th>
              {compareVendors.map((vendor) => (
                <td key={vendor.id}>{row.render(vendor)}</td>
              ))}
            </tr>
          ))}

          <tr>
            <th scope="row">Actions</th>
            {compareVendors.map((vendor) => (
              <td key={vendor.id}>
                <div className="cmp-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => openModal('booking', { vendorId: vendor.id })}
                  >
                    Book Now
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openModal('vendor', { vendorId: vendor.id })}
                  >
                    View Vendor
                  </button>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
