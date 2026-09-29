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
    <section className="benefits section" aria-label="Why book with One Ocean Events">
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
