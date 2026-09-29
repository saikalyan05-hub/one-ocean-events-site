import Icon from '../common/Icon';
import './TrustRow.css';

/**
 * Trust badges sitting directly under the hero search (spec §7).
 *
 * These describe platform features, not verified vendor counts. "Trusted by
 * 1000+ Events" is illustrative demo copy and is labelled as such for assistive
 * tech and on hover, so it is never read as an audited statistic.
 */
const ITEMS = [
  { icon: 'checkCircle', label: 'Verified Vendors', tone: 'teal' },
  { icon: 'scale', label: 'Compare & Choose', tone: 'lavender' },
  { icon: 'calendar', label: 'Easy Booking', tone: 'orange' },
  { icon: 'shield', label: 'Trusted by 1000+ Events', tone: 'sky', demo: true },
];

export default function TrustRow() {
  return (
    <ul className="trust-row">
      {ITEMS.map((item) => (
        <li key={item.label} className="trust-item">
          <span className={`trust-icon trust-${item.tone}`} aria-hidden="true">
            <Icon name={item.icon} size={15} />
          </span>
          <span className="trust-label" title={item.demo ? 'Illustrative demo figure, not an audited statistic.' : undefined}>
            {item.label}
            {item.demo && <span className="sr-only"> (illustrative demo figure)</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
