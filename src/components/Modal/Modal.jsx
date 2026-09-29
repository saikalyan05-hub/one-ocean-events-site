import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../common/Icon';
import './Modal.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Tracks nested modals so only the topmost one reacts to Escape and locks scroll. */
let openCount = 0;

/**
 * Accessible dialog:
 *  - renders in a portal above all page content
 *  - traps Tab focus inside, restores focus to the trigger on close
 *  - closes on Escape and on backdrop click
 *  - locks body scroll without shifting layout
 */
export default function Modal({
  open = true,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  labelledBy,
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const autoId = useId();
  const titleId = labelledBy ?? `modal-title-${autoId}`;

  const close = useCallback(() => onClose?.(), [onClose]);

  /* Body scroll lock — compensate for the scrollbar so the page does not jump. */
  useEffect(() => {
    if (!open) return undefined;
    openCount += 1;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    if (openCount === 1) {
      body.style.overflow = 'hidden';
      if (gap > 0) body.style.paddingRight = `${gap}px`;
    }
    return () => {
      openCount -= 1;
      if (openCount === 0) {
        body.style.overflow = prevOverflow;
        body.style.paddingRight = prevPad;
      }
    };
  }, [open]);

  /* Focus management. */
  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    const panel = panelRef.current;
    const first = panel?.querySelector(FOCUSABLE);
    (first ?? panel)?.focus?.();
    return () => {
      const target = previouslyFocused.current;
      if (target instanceof HTMLElement && document.contains(target)) target.focus();
    };
  }, [open]);

  /* Escape + Tab trap. Only the topmost dialog handles the key. */
  useEffect(() => {
    if (!open) return undefined;
    const myDepth = openCount;

    const onKeyDown = (e) => {
      if (myDepth !== openCount) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) ?? []).filter(
        (n) => n.offsetParent !== null || n === document.activeElement,
      );
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, close]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        className={`modal-panel modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : labelledBy}
        tabIndex={-1}
      >
        {title && (
          <header className="modal-head">
            <div className="modal-head-text">
              <h2 id={titleId} className="modal-title">
                {title}
              </h2>
              {subtitle && <p className="modal-subtitle">{subtitle}</p>}
            </div>
            <button type="button" className="modal-close" onClick={close} aria-label="Close dialog">
              <Icon name="close" size={18} />
            </button>
          </header>
        )}

        {!title && (
          <button type="button" className="modal-close modal-close-float" onClick={close} aria-label="Close dialog">
            <Icon name="close" size={18} />
          </button>
        )}

        <div className="modal-body">{children}</div>

        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
