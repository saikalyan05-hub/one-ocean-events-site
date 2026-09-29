import { Link } from 'react-router-dom';

/** Brand mark: sun over an ocean wave, paired with the two-line wordmark. */
export default function Logo({ compact = false }) {
  return (
    <Link to="/" className={`logo ${compact ? 'logo-compact' : ''}`.trim()} aria-label="One Ocean Events — home">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="100%" height="100%" focusable="false">
          <defs>
            <linearGradient id="ooe-sun" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFC65C" />
              <stop offset="100%" stopColor="#FF6B5E" />
            </linearGradient>
            <linearGradient id="ooe-sea" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#49B6E8" />
              <stop offset="100%" stopColor="#18B7A0" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="23" fill="#fff" stroke="#FFE2CF" strokeWidth="2" />
          <circle cx="24" cy="20" r="9.5" fill="url(#ooe-sun)" />
          <path
            d="M4 29c4.5 0 4.5 4 9 4s4.5-4 9-4 4.5 4 9 4 4.5-4 9-4v8a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-8Z"
            fill="url(#ooe-sea)"
          />
          <path
            d="M7 26.5c3.6 0 3.6 3 7.2 3s3.6-3 7.2-3 3.6 3 7.2 3 3.6-3 7.2-3"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity=".75"
          />
        </svg>
      </span>
      <span className="logo-words">
        <span className="logo-top">ONE OCEAN</span>
        <span className="logo-bottom">EVENTS</span>
      </span>
    </Link>
  );
}
