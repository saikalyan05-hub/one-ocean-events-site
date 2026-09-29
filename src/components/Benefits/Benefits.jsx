import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import './Benefits.css';

/** Four benefit cards closing the homepage (spec §21). */
const BENEFITS = [
  {
    icon: 'calendar',
    tone: 'pink',
    title: 'Easy Booking',
    text: 'Book your favourite vendors in minutes',
    to: '/vendors',
  },
  {
    icon: 'scale',
    tone: 'lavender',
    title: 'Compare Vendors',
    text: 'Compare up to 3 vendors side by side',
    to: '/vendors',
  },
  {
    icon: 'shield',
    tone: 'mint',
    title: 'Trusted Professionals',
    text: 'Verified and experienced vendors',
    to: '/how-it-works',
  },
  {
    icon: 'heart',
    tone: 'peach',
    title: 'Your Special Day',
    text: 'We make your moments memorable',
    to: '/about',
  },
];

export default function Benefits() {
  return (
    <section className="benefits section" aria-labelledby="benefits-heading">
      <div className="section-head benefits-head">
        <div>
          <p className="eyebrow">Why One Ocean</p>
          <h2 id="benefits-heading" className="section-title">
            Everything You Need to <span className="accent">Celebrate</span>
          </h2>
          <p className="section-sub">From the first shortlist to the day itself, in one place</p>
        </div>
      </div>

      <ul className="benefits-grid">
        {BENEFITS.map((benefit) => (
          <li key={benefit.title}>
            <Link to={benefit.to} className={`benefit-card benefit-${benefit.tone}`}>
              <span className="benefit-icon" aria-hidden="true">
                <Icon name={benefit.icon} size={24} />
              </span>
              <span className="benefit-text">
                <span className="benefit-title">{benefit.title}</span>
                <span className="benefit-sub">{benefit.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
