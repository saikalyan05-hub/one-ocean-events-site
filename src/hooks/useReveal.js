import { useEffect, useRef, useState } from 'react';

/**
 * One-shot scroll reveal (update spec §13).
 *
 * Returns `[ref, shown]`. The element fades and rises once, the first time it
 * scrolls into view, then the observer disconnects. It fails safe: without
 * IntersectionObserver, or when the visitor prefers reduced motion, the content
 * is marked shown immediately so nothing is ever left hidden.
 */
export default function useReveal({ threshold = 0.14, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shown, threshold, rootMargin]);

  return [ref, shown];
}
