import { useId } from 'react';
import './Decor.css';

/**
 * Decorative botanical layer — gold-veined leaves, sprigs, petals and bokeh.
 *
 * Design language is taken from the floral-frame reference: gilded and sage
 * foliage with small blush petals, arranged as a *frame* rather than a fill.
 *
 * Rules this file exists to enforce:
 *  - the whole layer is absolutely positioned and `pointer-events: none`, so it
 *    can never push content, block the search bar, or create a scrollbar
 *  - every element is anchored to an edge or corner; nothing is placed where
 *    headings, search, cards or buttons live
 *  - it paints beneath content (`--z-decor`), never over it
 *  - density steps down at tablet (`hide-md`) and again on mobile (`hide-sm`)
 *  - all drift is disabled under `prefers-reduced-motion`
 */

/* Foliage tones. Gold and sage only — the reference frame has no bright hues. */
const TONES = {
  gold: ['#f0dda8', '#c19a4b'],
  goldDeep: ['#dcc182', '#9c7328'],
  sage: ['#9fb394', '#5c7355'],
  forest: ['#7d9a76', '#38523a'],
};

/** Lanceolate leaf with a centre vein and fine side veins. */
function Leaf({ tone = 'gold', id }) {
  const [light, dark] = TONES[tone] ?? TONES.gold;
  const gid = `lf-${id}`;
  return (
    <svg viewBox="0 0 26 62" width="100%" height="100%" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path
        d="M13 1C5 10 1 20 1 31c0 11 5 21 12 30 7-9 12-19 12-30 0-11-4-21-12-30Z"
        fill={`url(#${gid})`}
      />
      <path d="M13 4v54" stroke={dark} strokeWidth="1" opacity=".5" fill="none" />
      <path
        d="M13 14 6 20M13 14l7 6M13 26 5 33M13 26l8 7M13 38 7 44M13 38l6 6"
        stroke={dark}
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity=".38"
      />
    </svg>
  );
}

/** A curved stem carrying alternating leaflets — the reference's gold sprigs. */
function Sprig({ tone = 'gold', id }) {
  const [light, dark] = TONES[tone] ?? TONES.gold;
  const gid = `sp-${id}`;
  return (
    <svg viewBox="0 0 90 120" width="100%" height="100%" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={dark} />
          <stop offset="100%" stopColor={light} />
        </linearGradient>
      </defs>
      <path
        d="M8 116C22 92 34 66 44 40 50 24 54 12 56 3"
        stroke={`url(#${gid})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {[
        'M20 96c9-9 20-11 27-6-7 8-18 11-27 6Z',
        'M30 74c8-10 19-13 26-8-6 9-17 13-26 8Z',
        'M39 52c7-11 18-15 25-11-5 10-15 15-25 11Z',
        'M47 30c6-11 16-16 24-13-4 10-14 16-24 13Z',
        'M16 88c-9-7-13-17-10-24 8 5 13 15 10 24Z',
        'M27 64c-9-6-14-16-11-23 8 4 14 14 11 23Z',
        'M37 41c-8-6-13-16-10-23 8 5 13 15 10 23Z',
      ].map((d, i) => (
        <path key={i} d={d} fill={`url(#${gid})`} opacity={i > 3 ? 0.78 : 1} />
      ))}
    </svg>
  );
}

/** Blush petal — the loose pink petals drifting through the reference frame. */
function Petal({ id }) {
  const gid = `pt-${id}`;
  return (
    <svg viewBox="0 0 20 30" width="100%" height="100%" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbd3dd" />
          <stop offset="100%" stopColor="#e8879f" />
        </linearGradient>
      </defs>
      <path d="M10 1C4 8 1 15 1 20c0 6 4 9 9 9s9-3 9-9c0-5-3-12-9-19Z" fill={`url(#${gid})`} />
      <path d="M10 5v21" stroke="#fff" strokeWidth="0.9" opacity=".45" fill="none" />
    </svg>
  );
}

/** Five-petal blossom for the densest corner clusters. */
function Bloom({ id }) {
  const gid = `bl-${id}`;
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" focusable="false" aria-hidden="true">
      <defs>
        <radialGradient id={gid}>
          <stop offset="0%" stopColor="#fff4f6" />
          <stop offset="100%" stopColor="#f3b6c6" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="20"
          cy="11"
          rx="6.5"
          ry="9.5"
          fill={`url(#${gid})`}
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="4" fill="#e8cf95" />
    </svg>
  );
}

/*
 * Arrangements. Each entry is [component, tone, class] where the class carries
 * the placement — see Decor.css, where every position is expressed against an
 * edge (`top/left/right/bottom`) so nothing drifts into the content column.
 */
const HERO = {
  sprigs: [
    { id: 'hs1', tone: 'gold', cls: 'd-sprig-tl' },
    { id: 'hs2', tone: 'forest', cls: 'd-sprig-tl2' },
    { id: 'hs3', tone: 'gold', cls: 'd-sprig-bl hide-md' },
    { id: 'hs4', tone: 'goldDeep', cls: 'd-sprig-tr hide-sm' },
    { id: 'hs5', tone: 'sage', cls: 'd-sprig-br hide-md' },
  ],
  leaves: [
    { id: 'hl1', tone: 'gold', cls: 'd-leaf-tl' },
    { id: 'hl2', tone: 'sage', cls: 'd-leaf-bl hide-sm' },
    { id: 'hl3', tone: 'goldDeep', cls: 'd-leaf-br hide-md' },
  ],
  blooms: [
    { id: 'hb1', cls: 'd-bloom-tl' },
    { id: 'hb2', cls: 'd-bloom-bl hide-md' },
  ],
  petals: [
    { id: 'hp1', cls: 'd-petal-1' },
    { id: 'hp2', cls: 'd-petal-2 hide-sm' },
    { id: 'hp3', cls: 'd-petal-3 hide-md' },
    { id: 'hp4', cls: 'd-petal-4 hide-sm' },
  ],
  bokeh: ['d-bok-1', 'd-bok-2', 'd-bok-3 hide-sm', 'd-bok-4 hide-md'],
};

/*
 * Sized for the crown of the sign-in dialog — a ~440px band, so the page
 * preset's full-size sprigs would swamp it. Two mirrored corner sprigs and a
 * single petal, all outside the 60% of the band the title occupies.
 */
const AUTH = {
  sprigs: [
    { id: 'as1', tone: 'gold', cls: 'd-sprig-auth-tl' },
    { id: 'as2', tone: 'goldDeep', cls: 'd-sprig-auth-tr' },
  ],
  leaves: [],
  blooms: [],
  petals: [{ id: 'ap1', cls: 'd-petal-auth' }],
  bokeh: [],
};

const PAGE = {
  sprigs: [
    { id: 'ps1', tone: 'gold', cls: 'd-sprig-tr hide-sm' },
    { id: 'ps2', tone: 'sage', cls: 'd-sprig-bl hide-md' },
  ],
  leaves: [{ id: 'pl1', tone: 'goldDeep', cls: 'd-leaf-tl hide-md' }],
  blooms: [],
  petals: [
    { id: 'pp1', cls: 'd-petal-1 hide-sm' },
    { id: 'pp2', cls: 'd-petal-3 hide-md' },
  ],
  bokeh: ['d-bok-2 hide-sm'],
};

/**
 * @param {'hero'|'page'|'auth'} scope  Which preset arrangement to render.
 * @param {'light'|'dark'} on    Surface it sits on; dims the foliage on ivory.
 */
export default function Decor({ scope = 'hero', on = 'dark' }) {
  const uid = useId().replace(/:/g, '');
  const set = scope === 'hero' ? HERO : scope === 'auth' ? AUTH : PAGE;

  return (
    <div className={`decor-layer decor-${scope} decor-on-${on}`} aria-hidden="true">
      {set.sprigs.map((s) => (
        <span key={s.id} className={`decor decor-sprig ${s.cls}`}>
          <Sprig tone={s.tone} id={`${uid}${s.id}`} />
        </span>
      ))}
      {set.leaves.map((l) => (
        <span key={l.id} className={`decor decor-leaf ${l.cls}`}>
          <Leaf tone={l.tone} id={`${uid}${l.id}`} />
        </span>
      ))}
      {set.blooms.map((b) => (
        <span key={b.id} className={`decor decor-bloom ${b.cls}`}>
          <Bloom id={`${uid}${b.id}`} />
        </span>
      ))}
      {set.petals.map((p) => (
        <span key={p.id} className={`decor decor-petal ${p.cls}`}>
          <Petal id={`${uid}${p.id}`} />
        </span>
      ))}
      {set.bokeh.map((cls) => (
        <span key={cls} className={`decor decor-bokeh ${cls}`} />
      ))}
    </div>
  );
}
