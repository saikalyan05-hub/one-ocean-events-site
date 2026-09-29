import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../common/Icon';
import VendorCard from './VendorCard';
import './VendorCarousel.css';

/**
 * Horizontal vendor carousel.
 *
 * Built on native overflow scrolling with scroll-snap, which gives touch drag,
 * trackpad swipe and keyboard scrolling for free. The arrows page the track and
 * disable themselves at each end (spec §9 / §12).
 */
export default function VendorCarousel({ vendors, label = 'Featured vendors' }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    // 2px tolerance absorbs sub-pixel rounding at fractional zoom levels.
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, [sync, vendors.length]);

  const page = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll by a near-full page, leaving one card visible for context.
    const card = el.querySelector('.carousel-item');
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth;
    const pageSize = Math.max(step, el.clientWidth - step);
    el.scrollBy({ left: direction * pageSize, behavior: 'smooth' });
  };

  const scrollable = !(atStart && atEnd);

  return (
    <div className="carousel">
      <div
        ref={trackRef}
        className="carousel-track"
        role="group"
        aria-label={label}
        tabIndex={scrollable ? 0 : -1}
      >
        {vendors.map((vendor, i) => (
          <div key={vendor.id} className="carousel-item">
            <VendorCard vendor={vendor} eager={i < 3} />
          </div>
        ))}
      </div>

      {scrollable && (
        <>
          <button
            type="button"
            className="carousel-arrow carousel-prev"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label="Previous vendors"
          >
            <Icon name="chevronLeft" size={20} />
          </button>
          <button
            type="button"
            className="carousel-arrow carousel-next"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label="Next vendors"
          >
            <Icon name="chevronRight" size={20} />
          </button>
        </>
      )}
    </div>
  );
}
