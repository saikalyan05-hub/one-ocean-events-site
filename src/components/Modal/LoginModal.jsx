import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import Decor from '../Hero/Decor';
import Modal from './Modal';
import './LoginModal.css';

/** Deliberately permissive: enough to catch a typo, not a validation library. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Sign-in placeholder (spec §16).
 *
 * SECURITY: there is no password field and no credential check, by design —
 * shipping a fake password box invites someone to type a real one. The
 * production replacement posts to /api/auth/login over HTTPS, which hashes
 * with bcrypt/argon2, sets an HTTP-only SameSite cookie, and applies rate
 * limiting plus CAPTCHA. No secret should ever live in this bundle.
 */
export default function LoginModal({ onClose }) {
  const { login } = useApp();
  const [values, setValues] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!values.name.trim()) found.name = 'Tell us what to call you.';
    if (!values.email.trim()) found.email = 'Enter your email address.';
    else if (!EMAIL_RE.test(values.email.trim())) found.email = 'That email address looks incomplete.';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await login(values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      size="sm"
      /* Blush crown with a small floral frame over an ivory form (spec §16).
         Presentation only — the sign-in handler below is untouched. */
      className="login-modal"
      crown={<Decor scope="auth" on="light" />}
      onClose={onClose}
      title="Welcome to One Ocean Events"
      subtitle="Sign in to save vendors and track your bookings"
      labelledBy="login-title"
    >
      <form className="login" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="login-name">Your name</label>
          <input
            id="login-name"
            className="input"
            autoComplete="name"
            placeholder="e.g. Priya"
            value={values.name}
            onChange={set('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'login-name-err' : undefined}
          />
          {errors.name && (
            <p className="field-error" id="login-name-err">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="input"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={set('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-err' : undefined}
          />
          {errors.email && (
            <p className="field-error" id="login-email-err">
              {errors.email}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Continue'}
        </button>

        <p className="login-note">
          <Icon name="shield" size={15} />
          <span>
            <strong>Demo sign-in.</strong> No password is asked for and nothing is sent anywhere —
            your name and email stay in this browser. Please don't enter details you would not want
            stored locally.
          </span>
        </p>
      </form>
    </Modal>
  );
}
