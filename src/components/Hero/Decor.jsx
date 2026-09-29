import './Decor.css';

/**
 * Decorative layer: leaves and butterflies (spec §5).
 *
 * Rules this file exists to enforce:
 *  - the whole layer is `position: absolute` + `pointer-events: none`, so it can
 *    never push content, block the search bar or create a scrollbar
 *  - density is reduced at tablet width and again on mobile via `hide-*` classes
 *  - all motion is disabled under `prefers-reduced-motion`
 */

const LEAF_TONES = {
  teal: ['#8FE3D2', '#18B7A0'],
  sky: ['#A9DDF7', '#49B6E8'],
  coral: ['#FFB3AA', '#FF6B5E'],
  lavender: ['#D8C2FF', '#B68CFF'],
  orange: ['#FFD3A8', '#FF9F43'],
  mint: ['#CFF3E7', '#7FD9BE'],
};

function Leaf({ tone = 'teal', id }) {
  const [light, dark] = LEAF_TONES[tone] ?? LEAF_TONES.teal;
  const gid = `leaf-${id}`;
  return (
    <svg viewBox="0 0 64 100" width="100%" height="100%" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path
        d="M32 2C12 20 2 44 6 66c3 17 15 30 26 32 11-2 23-15 26-32C62 44 52 20 32 2Z"
        fill={`url(#${gid})`}
      />
      <path d="M32 8v88" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <path
        d="M32 26 16 36M32 26l16 10M32 46 14 58M32 46l18 12M32 66 20 76M32 66l12 10"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity=".45"
      />
    </svg>
  );
}

function Butterfly({ tone = 'coral', id }) {
  const [light, dark] = LEAF_TONES[tone] ?? LEAF_TONES.coral;
  const gid = `bf-${id}`;
  return (
    <svg viewBox="0 0 64 56" width="100%" height="100%" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <g fill={`url(#${gid})`}>
        <path d="M31 28C24 12 14 4 6 8c-7 4-6 18 2 24 6 5 15 3 23-4Z" />
        <path d="M33 28c7-16 17-24 25-20 7 4 6 18-2 24-6 5-15 3-23-4Z" />
        <path d="M30 30c-6 10-13 16-20 14-6-2-6-11 0-15 5-3 13-2 20 1Z" opacity=".85" />
        <path d="M34 30c6 10 13 16 20 14 6-2 6-11 0-15-5-3-13-2-20 1Z" opacity=".85" />
      </g>
      <ellipse cx="32" cy="29" rx="2.4" ry="8" fill="#5a3a2e" />
      <path
        d="M31 21c-2-4-5-6-8-6M33 21c2-4 5-6 8-6"
        stroke="#5a3a2e"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * @param {'hero'|'page'} scope  Chooses which preset arrangement to render.
 */
export default function Decor({ scope = 'hero' }) {
  const leaves =
    scope === 'hero'
      ? [
          { id: 'l1', tone: 'teal', cls: 'd-l1' },
          { id: 'l2', tone: 'coral', cls: 'd-l2' },
          { id: 'l3', tone: 'sky', cls: 'd-l3 hide-sm' },
          { id: 'l4', tone: 'orange', cls: 'd-l4 hide-md' },
          { id: 'l5', tone: 'mint', cls: 'd-l5 hide-sm' },
          { id: 'l6', tone: 'lavender', cls: 'd-l6 hide-md' },
          { id: 'l7', tone: 'teal', cls: 'd-l7 hide-md' },
          { id: 'l8', tone: 'coral', cls: 'd-l8 hide-sm' },
        ]
      : [
          { id: 'p1', tone: 'mint', cls: 'd-p1 hide-sm' },
          { id: 'p2', tone: 'lavender', cls: 'd-p2 hide-md' },
          { id: 'p3', tone: 'sky', cls: 'd-p3 hide-md' },
        ];

  const butterflies =
    scope === 'hero'
      ? [
          { id: 'b1', tone: 'orange', cls: 'd-b1' },
          { id: 'b2', tone: 'coral', cls: 'd-b2 hide-sm' },
          { id: 'b3', tone: 'lavender', cls: 'd-b3 hide-md' },
        ]
      : [{ id: 'pb1', tone: 'orange', cls: 'd-pb1 hide-sm' }];

  return (
    <div className={`decor-layer decor-${scope}`} aria-hidden="true">
      {leaves.map((leaf) => (
        <span key={leaf.id} className={`decor decor-leaf ${leaf.cls}`}>
          <Leaf tone={leaf.tone} id={leaf.id} />
        </span>
      ))}
      {butterflies.map((b) => (
        <span key={b.id} className={`decor decor-butterfly ${b.cls}`}>
          <Butterfly tone={b.tone} id={b.id} />
        </span>
      ))}
    </div>
  );
}
