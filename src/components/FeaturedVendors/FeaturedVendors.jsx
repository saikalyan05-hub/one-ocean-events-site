import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import VendorCarousel from './VendorCarousel';
import './FeaturedVendors.css';

/**
 * Featured Vendors section (spec §9): crown heading, subtitle, "View All
 * Vendors" link and the carousel. Vendors are passed in already sorted so this
 * component stays presentational.
 */
export default function FeaturedVendors({ vendors }) {
  return (
    <section className="featured section" aria-labelledby="featured-heading">
      <div className="section-head featured-head">
        <div className="featured-title-wrap">
          <span className="featured-crown" aria-hidden="true">
            <svg viewBox="0 0 48 40" width="42" height="35" focusable="false">
              <defs>
                <linearGradient id="crown-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFD166" />
                  <stop offset="100%" stopColor="#FF9F43" />
                </linearGradient>
              </defs>
              <path
                d="M4 32 2 10l11 8L24 4l11 14 11-8-2 22H4Z"
                fill="url(#crown-g)"
                stroke="#F08A2E"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <rect x="4" y="33" width="40" height="5" rx="2.5" fill="#FF9F43" />
            </svg>
          </span>
          <div>
            <h2 id="featured-heading" className="section-title">
              Featured <span className="accent">Vendors</span>
            </h2>
            <p className="section-sub">Top rated and trusted professionals for your special day</p>
          </div>
        </div>

        <Link to="/vendors" className="featured-link">
          View All Vendors
          <Icon name="arrowRight" size={18} />
        </Link>
      </div>

      <VendorCarousel vendors={vendors} label="Featured vendors" />
    </section>
  );
}
