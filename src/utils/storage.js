/**
 * Namespaced, crash-safe localStorage wrapper.
 *
 * Every read is defensive: private browsing, disabled storage and corrupted JSON
 * all fall back to the supplied default rather than throwing during render.
 */

const PREFIX = 'ooe:';

export const STORAGE_KEYS = {
  wishlist: 'wishlist',
  bookings: 'bookings',
  conversations: 'conversations',
  notifications: 'notifications',
  settings: 'settings',
  // Admin-side overrides (vendor / review / customer status changes) kept apart
  // from the seed data they override.
  admin: 'admin',
  auth: 'auth',
  location: 'location',
  // Records which demo seed has already been written, so a returning visitor
  // keeps their own changes instead of having them overwritten on every load.
  seed: 'seed',
};

const available = (() => {
  try {
    const probe = `${PREFIX}__probe__`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
})();

/** In-memory fallback so the demo still works when storage is blocked. */
const memory = new Map();

export function readStorage(key, fallback) {
  const full = PREFIX + key;
  try {
    const raw = available ? window.localStorage.getItem(full) : memory.get(full);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  const full = PREFIX + key;
  try {
    const raw = JSON.stringify(value);
    if (available) window.localStorage.setItem(full, raw);
    else memory.set(full, raw);
    return true;
  } catch {
    return false;
  }
}

export function clearStorage() {
  try {
    if (available) {
      Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(PREFIX + k));
    }
    memory.clear();
  } catch {
    /* nothing recoverable to do */
  }
}

export const storageAvailable = available;
