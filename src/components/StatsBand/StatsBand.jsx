import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import './StatsBand.css';

/**
 * Statistics / trust band (spec §5, between Featured Vendors and social proof).
 *
 * Two of these four are computed from the catalogue the app actually ships, so
 * they cannot drift away from what the site contains. The other two are
 * illustrative and are labelled as such — this codebase does not present an
 * invented number as an audited one (see DEMO_NOTICE in data/vendors.js).
 */
const STATS = [
  {
    key: 'events',
    icon: 'sparkle',
    value: '1000+',
    label: 'Successful Events',
    demo: true,
  },
  {
    key: 'vendors',
    icon: 'shield',
    label: 'Vendors Listed',
  },
  {
    key: 'rating',
    icon: 'star',
    label: 'Average Rating',
    demo: true,
  },
  {
    key: 'cities',
    icon: 'pin',
    label: 'Cities Served',
  },
];

const DEMO_STAT_NOTICE = 'Illustrative demo figure, not an audited statistic.';

export default function StatsBand() {
  const { vendors } = useApp();

  /* Catalogue-derived values: whatever ships in data/vendors.js is what shows. */
  const vendorCount = vendors.length;
  const cityCount = new Set(vendors.map((v) => v.location)).size;
  const avgRating = vendors.length
    ? (vendors.reduce((sum, v) => sum + v.demo.rating, 0) / vendors.length).toFixed(1)
    : '—';

  const resolved = {
    vendors: `${vendorCount}`,
    cities: `${cityCount}`,
    rating: `${avgRating}/5`,
  };

  return (
    <section className="stats-band" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">
        One Ocean Events at a glance
      </h2>

      <ul className="stats-grid">
        {STATS.map((stat) => (
          <li key={stat.key} className="stat-card">
            <span className="stat-icon" aria-hidden="true">
              <Icon name={stat.icon} size={20} />
            </span>
            <span
              className="stat-value"
              title={stat.demo ? DEMO_STAT_NOTICE : undefined}
            >
              {stat.value ?? resolved[stat.key]}
            </span>
            <span className="stat-label">
              {stat.label}
              {stat.demo && <span className="sr-only"> — {DEMO_STAT_NOTICE}</span>}
            </span>
            {stat.demo && (
              <span className="stat-demo" title={DEMO_STAT_NOTICE} aria-hidden="true">
                Demo
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
