import { useId } from 'react';
import { Link } from 'react-router-dom';

/**
 * Brand mark — two interlocking rings (crimson + ocean blue) above the wordmark.
 *
 * The supplied logo file is a screenshot with a navy photographic background
 * baked in, so it cannot be dropped onto ivory surfaces. This is a faithful
 * vector rebuild of the same mark: same two-ring "OO" lockup, same hues, same
 * proportions — and it stays crisp at every size and works on both surfaces.
 *
 * The interlock is produced by repainting a clipped slice of the crimson ring
 * over the blue one at the upper crossing, so the two read as linked rather
 * than merely overlapping.
 *
 * The wordmark inherits `currentColor`, so the same component sits on navy (in
 * the header and footer) and on ivory without a variant.
 *
 * @param {boolean} compact  Horizontal lockup — mark beside the wordmark.
 * @param {boolean} markOnly Renders just the rings, for tight spaces.
 */
export default function Logo({ compact = false, markOnly = false, to = '/' }) {
  // Unique per instance: the header and footer both render a Logo, and duplicate
  // gradient ids would make the second instance reuse the first one's paint.
  const uid = useId().replace(/:/g, '');
  const crimson = `ooe-crimson-${uid}`;
  const ocean = `ooe-ocean-${uid}`;
  const linkClip = `ooe-link-${uid}`;

  const mark = (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 50 44" width="100%" height="100%" focusable="false">
        <defs>
          <linearGradient id={crimson} x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#ff2a62" />
            <stop offset="55%" stopColor="#e8174c" />
            <stop offset="100%" stopColor="#b8103f" />
          </linearGradient>
          <linearGradient id={ocean} x1="0.1" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bfe0f7" />
            <stop offset="55%" stopColor="#8fc4ee" />
            <stop offset="100%" stopColor="#5fa3dd" />
          </linearGradient>
          {/* The upper crossing, where the crimson ring passes in front. */}
          <clipPath id={linkClip}>
            <rect x="19" y="5" width="12.5" height="13.5" />
          </clipPath>
        </defs>

        {/* Left ring — crimson. */}
        <circle cx="17" cy="22" r="11.5" fill="none" stroke={`url(#${crimson})`} strokeWidth="7.4" />
        {/* Right ring — ocean blue, painted over the crimson at both crossings. */}
        <circle cx="33" cy="22" r="11.5" fill="none" stroke={`url(#${ocean})`} strokeWidth="7.4" />
        {/* …then the crimson returns on top at the upper crossing only, which is
            what makes the pair read as interlocked. */}
        <g clipPath={`url(#${linkClip})`}>
          <circle cx="17" cy="22" r="11.5" fill="none" stroke={`url(#${crimson})`} strokeWidth="7.4" />
        </g>
      </svg>
    </span>
  );

  return (
    <Link
      to={to}
      className={`logo ${compact ? 'logo-compact' : ''} ${markOnly ? 'logo-markonly' : ''}`.trim()}
      aria-label="One Ocean Events — home"
    >
      {mark}
      {!markOnly && <span className="logo-words">One Ocean Events</span>}
    </Link>
  );
}
