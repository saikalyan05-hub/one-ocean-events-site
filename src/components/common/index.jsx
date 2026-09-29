import { Link } from 'react-router-dom';
import Icon from './Icon';
import { DEMO_NOTICE } from '../../data/vendors';
import { FALLBACK_IMAGE } from '../../data/images';
import './common.css';

export { default as Icon } from './Icon';

/**
 * Marks any value that is placeholder UI rather than a verified vendor fact
 * (spec §22 / §38). Rendered next to ratings, prices and verification states.
 */
export function DemoTag({ label = 'Demo', notice = DEMO_NOTICE }) {
  return (
    <span className="demo-tag" title={notice}>
      {label}
      <span className="sr-only"> — {notice}</span>
    </span>
  );
}

/** Rating display. Always paired with a DemoTag because ratings are demo data. */
export function Stars({ value, count, showTag = true }) {
  if (value == null) return null;
  return (
    <span className="stars">
      <Icon name="star" size={15} />
      <span className="stars-value">{value.toFixed(1)}</span>
      {count != null && <span className="stars-count">({count})</span>}
      {showTag && <DemoTag notice="Demo rating — not collected from real reviews." />}
      <span className="sr-only">out of 5, demo data</span>
    </span>
  );
}

export function EmptyState({ icon = 'sparkle', title, text, actions }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={30} />
      </div>
      <p className="empty-state-title">{title}</p>
      {text && <p className="empty-state-text">{text}</p>}
      {actions && <div className="empty-state-actions">{actions}</div>}
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}

/** `items` is [{ label, to? }] — the last entry is rendered as the current page. */
export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <Icon name="chevronRight" size={13} />}
            {last || !item.to ? (
              <span aria-current={last ? 'page' : undefined}>{item.label}</span>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** Image that lazy-loads below the fold and degrades to a known-good fallback. */
export function SafeImage({ src, alt, eager = false, className = '', ...rest }) {
  return (
    <img
      src={src || FALLBACK_IMAGE}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      onError={(e) => {
        if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
      }}
      {...rest}
    />
  );
}
