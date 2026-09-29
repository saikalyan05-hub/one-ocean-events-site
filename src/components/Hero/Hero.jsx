import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { HERO_IMAGE } from '../../data/images';
import Icon from '../common/Icon';
import { SafeImage } from '../common';
import SearchBar from '../SearchBar/SearchBar';
import TrustRow from '../TrustRow/TrustRow';
import Decor from './Decor';
import './Hero.css';

/**
 * Homepage hero.
 *
 * Composition follows the royal reference: a bright blush stage with the event
 * photograph filling the right half and feathering into the page across the
 * middle, the headline and search on the left, and a floating white vendor
 * highlight card over the photograph.
 *
 * The photo/page boundary is a gradient mask rather than a hard edge, so it
 * scales to any width without the seam a clip-path produces.
 */
export default function Hero() {
  const { openModal, vendors } = useApp();
  const heroRef = useRef(null);

  /* The card mirrors a real listing, so the hero never advertises a vendor the
     catalogue does not contain. */
  const highlight = vendors?.[0];

  /*
   * Pointer parallax. The pointer position is published once per frame as two
   * normalised custom properties (--hero-px / --hero-py, each roughly -1…1) on
   * the section; the CSS reads them to tilt the photo and the card, and to
   * drift the decor and script at different depths.
   *
   * Tiered by device: it binds only on a fine pointer, with motion allowed, AND
   * at the width where the hero is still side-by-side. Below 900px the hero
   * stacks, so tablet and mobile keep only the gentle CSS float. All three are
   * live media queries, so resizing the window — or toggling reduced motion —
   * binds or unbinds on the fly and resets the layers to rest.
   */
  useEffect(() => {
    const node = heroRef.current;
    if (!node || typeof window === 'undefined' || !window.matchMedia) return undefined;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 900px)');

    let frame = 0;
    let px = 0;
    let py = 0;
    let bound = false;

    const commit = () => {
      frame = 0;
      node.style.setProperty('--hero-px', px.toFixed(3));
      node.style.setProperty('--hero-py', py.toFixed(3));
    };

    const onMove = (e) => {
      const rect = node.getBoundingClientRect();
      px = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      py = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(commit);
    };

    const reset = () => {
      px = 0;
      py = 0;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      node.style.setProperty('--hero-px', '0');
      node.style.setProperty('--hero-py', '0');
    };

    const bind = () => {
      if (bound) return;
      bound = true;
      node.addEventListener('pointermove', onMove);
      node.addEventListener('pointerleave', reset);
    };

    const unbind = () => {
      if (!bound) return;
      bound = false;
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', reset);
      reset();
    };

    const sync = () => {
      if (fine.matches && !reduce.matches && wide.matches) bind();
      else unbind();
    };

    sync();
    fine.addEventListener('change', sync);
    reduce.addEventListener('change', sync);
    wide.addEventListener('change', sync);

    return () => {
      fine.removeEventListener('change', sync);
      reduce.removeEventListener('change', sync);
      wide.removeEventListener('change', sync);
      unbind();
    };
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-heading" ref={heroRef}>
      {/* ---- stage: photograph, dissolve, warm light ---- */}
      <div className="hero-stage" aria-hidden="true">
        <img
          className="hero-bg"
          src={HERO_IMAGE}
          alt=""
          width="1600"
          height="1000"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <span className="hero-dissolve" />
        <span className="hero-vignette" />
        <span className="hero-glow" />
      </div>

      <Decor scope="hero" on="light" />

      <div className="hero-inner container">
        <div className="hero-copy">
          <p className="hero-eyebrow eyebrow">
            <span>Plan</span>
            <span className="dot" aria-hidden="true">•</span>
            <span>Book</span>
            <span className="dot" aria-hidden="true">•</span>
            <span>Celebrate</span>
          </p>

          {/* "Starts" gold, "Here" pink — the reference's two brand accents,
              as separate spans because one gold→pink ramp muddies in the middle. */}
          <h1 id="hero-heading" className="hero-title">
            <span className="hero-line-1">Your Perfect Event</span>
            <span className="hero-line-2">
              <span className="hero-word-gold">Starts </span>
              <span className="hero-word-pink">Here</span>
            </span>
          </h1>

          {/* Calligraphic flourish under the headline. */}
          <svg
            className="hero-swash"
            viewBox="0 0 260 16"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M2 11c26-8 52-9 78-3 20 4 38 6 56 1 16-4 32-7 48-3 16 4 30 8 46 5 12-2 22-6 28-9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M64 14c22-5 44-5 66 0"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              opacity=".55"
            />
          </svg>

          <p className="hero-lede">
            Discover trusted decorators, caterers, entertainers, venues and event professionals for
            weddings, parties and all your special occasions.
          </p>

          <SearchBar variant="hero" />
          <TrustRow />
        </div>

        {/* ---- floating vendor highlight, as in the reference ---- */}
        <div className="hero-media">
          {highlight && (
            <article className="hero-vendor">
              <div className="hero-vendor-media">
                <SafeImage
                  src={highlight.image}
                  alt={`Event work by ${highlight.facts.name}`}
                  eager
                  className="hero-vendor-img"
                />
              </div>

              <div className="hero-vendor-body">
                <h2 className="hero-vendor-name clamp-1" title={highlight.facts.name}>
                  {highlight.facts.name}
                  <span className="hero-vendor-verified" title="Verified vendor (demo)">
                    <Icon name="checkCircle" size={15} />
                    <span className="sr-only">Verified vendor — demo data</span>
                  </span>
                </h2>

                <p className="hero-vendor-rating">
                  <Icon name="star" size={14} />
                  <strong>{highlight.demo.rating.toFixed(1)}</strong>
                  <span>({highlight.demo.reviewCount} reviews)</span>
                  <span className="sr-only"> — demo rating, not collected from real reviews</span>
                </p>

                <p className="hero-vendor-meta">
                  <Icon name="arch" size={13} />
                  <span className="clamp-1">{highlight.facts.category}</span>
                </p>
                <p className="hero-vendor-meta">
                  <Icon name="pin" size={13} />
                  <span className="clamp-1">{highlight.location}</span>
                </p>

                <button
                  type="button"
                  className="btn btn-primary btn-sm btn-block"
                  onClick={() => openModal('vendor', { vendorId: highlight.id })}
                >
                  View Profile
                  <Icon name="arrowRight" size={15} />
                </button>
              </div>
            </article>
          )}

          <p className="hero-script" aria-hidden="true">
            Make<br />Moments<br />Memorable
          </p>
          <span className="hero-script-heart" aria-hidden="true">
            <Icon name="heart" size={20} />
          </span>

          <button type="button" className="hero-story" onClick={() => openModal('video')}>
            <span className="hero-story-play" aria-hidden="true">
              <Icon name="play" size={13} />
            </span>
            Watch Our Story
          </button>
        </div>
      </div>
    </section>
  );
}
