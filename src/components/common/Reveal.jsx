import useReveal from '../../hooks/useReveal';

/**
 * Wraps a block so it fades and rises once as it enters the viewport
 * (update spec §13). Purely additive depth: `delay` staggers siblings, and with
 * reduced motion — or no IntersectionObserver — the content shows immediately.
 *
 * @param {import('react').ElementType} [as='div']  Element to render.
 * @param {number} [delay=0]  Reveal delay in milliseconds.
 */
export default function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const [ref, shown] = useReveal();

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-inview' : ''} ${className}`.trim()}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
