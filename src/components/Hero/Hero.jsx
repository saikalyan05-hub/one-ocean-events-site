import { useApp } from '../../context/AppContext';
import { HERO_IMAGE } from '../../data/images';
import Icon from '../common/Icon';
import SearchBar from '../SearchBar/SearchBar';
import TrustRow from '../TrustRow/TrustRow';
import Decor from './Decor';
import './Hero.css';

/**
 * Homepage hero (spec §7).
 *
 * The organic boundary between the copy and the photograph is an SVG clipPath in
 * objectBoundingBox units, so the curve scales with the panel at every width and
 * is simply switched off below 900px where the layout stacks.
 */
export default function Hero() {
  const { openModal } = useApp();

  return (
    <section className="hero" aria-labelledby="hero-heading">
      {/* Soft colour wash behind everything. */}
      <div className="hero-wash" aria-hidden="true" />
      <Decor scope="hero" />

      <div className="hero-inner container">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span>PLAN</span>
            <span className="dot" aria-hidden="true">•</span>
            <span>BOOK</span>
            <span className="dot" aria-hidden="true">•</span>
            <span>CELEBRATE</span>
          </p>

          <h1 id="hero-heading" className="hero-title">
            <span className="hero-line-1">Your Perfect Event</span>
            <span className="hero-line-2">
              <span className="w-starts">Starts</span> <span className="w-here">Here</span>
            </span>
          </h1>

          <p className="hero-lede">
            Discover trusted decorators, caterers, entertainers and more for weddings, parties and all
            your special occasions.
          </p>

          <SearchBar variant="hero" />
          <TrustRow />
        </div>

        <div className="hero-media">
          <div className="hero-photo">
            <img
              src={HERO_IMAGE}
              alt="Wedding ceremony aisle lined with rose arrangements, leading to a draped floral arch"
              width="1200"
              height="1000"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          <p className="hero-script" aria-hidden="true">
            Make<br />Moments<br />Memorable
          </p>
          <span className="hero-script-heart" aria-hidden="true">
            <Icon name="heart" size={22} />
          </span>

          <button type="button" className="hero-story" onClick={() => openModal('video')}>
            <span className="hero-story-play" aria-hidden="true">
              <Icon name="play" size={14} />
            </span>
            Watch Our Story
          </button>
        </div>
      </div>

      {/* Single source of truth for the organic hero mask. */}
      <svg className="hero-defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="hero-organic" clipPathUnits="objectBoundingBox">
            <path
              d="M0.078,0
                 C0.028,0.12 0.014,0.22 0.026,0.34
                 C0.040,0.48 0.076,0.54 0.086,0.66
                 C0.096,0.80 0.118,0.88 0.152,1
                 L1,1 L1,0 Z"
            />
          </clipPath>
        </defs>
      </svg>
    </section>
  );
}
