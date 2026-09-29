import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import './Toast.css';

const TONE_ICON = {
  success: 'checkCircle',
  warning: 'info',
  default: 'sparkle',
};

/**
 * Toast stack. Announced politely so a screen reader hears the confirmation
 * without the focus being moved away from whatever the user just clicked.
 */
export default function ToastStack() {
  const { toasts, dismissToast } = useApp();

  return createPortal(
    <div className="toast-stack" role="region" aria-label="Notifications">
      <div aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            <Icon name={TONE_ICON[t.tone] ?? TONE_ICON.default} size={18} className="toast-icon" />
            <p className="toast-text">{t.message}</p>
            <button
              type="button"
              className="toast-dismiss"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
