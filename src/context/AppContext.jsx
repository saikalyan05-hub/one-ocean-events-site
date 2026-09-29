import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import * as api from '../services/api';
import { MAX_COMPARE } from '../services/api';
import { VENDORS } from '../data/vendors';
import { DEFAULT_LOCATION } from '../data/categories';
import { DEMO_CUSTOMER, SEED_COMPARE } from '../data/demoData';
import { readStorage, STORAGE_KEYS, writeStorage } from '../utils/storage';

/**
 * Single application store. Business logic lives here and in services/api.js;
 * components stay presentational and read through the `useApp()` hook.
 */

const AppContext = createContext(null);

const INITIAL_FILTERS = {
  query: '',
  categoryId: null,
  location: DEFAULT_LOCATION,
  sort: 'experience',
};

/* ------------------------------------------------------------------- toasts */

let toastSeq = 0;

function toastReducer(state, action) {
  switch (action.type) {
    case 'push':
      return [...state.slice(-2), action.toast];
    case 'dismiss':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

/* -------------------------------------------------------------------- seed */

/**
 * The demo ships pre-populated (update spec §2 — no screen should open empty),
 * so the shared demo model is written to storage once, before any state
 * initializer reads it. Idempotent: a returning visitor keeps their own
 * wishlist, bookings and messages.
 */
let seedChecked = false;
function ensureSeed() {
  if (seedChecked) return;
  seedChecked = true;
  api.seedDemoData();
}

/* -------------------------------------------------------------------- store */

export function AppProvider({ children }) {
  ensureSeed();

  const [wishlist, setWishlist] = useState(() => readStorage(STORAGE_KEYS.wishlist, []));
  const [compare, setCompare] = useState(() => [...SEED_COMPARE]);
  const [bookings, setBookings] = useState(() => readStorage(STORAGE_KEYS.bookings, []));
  const [conversations, setConversations] = useState(() => readStorage(STORAGE_KEYS.conversations, {}));
  const [notifications, setNotifications] = useState(() => readStorage(STORAGE_KEYS.notifications, []));
  const [settings, setSettings] = useState(() => ({
    ...api.DEFAULT_SETTINGS,
    ...readStorage(STORAGE_KEYS.settings, {}),
  }));
  const [user, setUser] = useState(() => readStorage(STORAGE_KEYS.auth, null));
  const [location, setLocation] = useState(() => readStorage(STORAGE_KEYS.location, DEFAULT_LOCATION));
  const [filters, setFiltersState] = useState(() => ({ ...INITIAL_FILTERS }));
  const [modals, setModals] = useState([]);
  const [toasts, dispatchToast] = useReducer(toastReducer, []);

  const timers = useRef(new Map());

  /* ---------------------------------------------------------------- toasts */

  const dismissToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    dispatchToast({ type: 'dismiss', id });
  }, []);

  const toast = useCallback(
    (message, options = {}) => {
      const id = `t${++toastSeq}`;
      dispatchToast({ type: 'push', toast: { id, message, tone: options.tone ?? 'default' } });
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), options.duration ?? 3200),
      );
      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  /* -------------------------------------------------------------- wishlist */

  const isWishlisted = useCallback((vendorId) => wishlist.includes(vendorId), [wishlist]);

  const toggleWishlist = useCallback(
    async (vendor) => {
      const { data, added } = await api.toggleWishlist(vendor.id);
      setWishlist(data);
      toast(
        added ? `Saved ${vendor.facts.name} to your wishlist` : `Removed ${vendor.facts.name} from your wishlist`,
        { tone: added ? 'success' : 'default' },
      );
      return added;
    },
    [toast],
  );

  /* --------------------------------------------------------------- compare */

  const isComparing = useCallback((vendorId) => compare.includes(vendorId), [compare]);

  const toggleCompare = useCallback(
    async (vendor) => {
      const exists = compare.includes(vendor.id);
      if (exists) {
        setCompare((prev) => prev.filter((id) => id !== vendor.id));
        toast(`Removed ${vendor.facts.name} from comparison`);
        return false;
      }
      if (compare.length >= MAX_COMPARE) {
        toast(`You can compare up to ${MAX_COMPARE} vendors. Remove one to add another.`, { tone: 'warning' });
        return false;
      }
      const next = [...compare, vendor.id];
      await api.validateCompare(next);
      setCompare(next);
      toast(`Added ${vendor.facts.name} to comparison (${next.length}/${MAX_COMPARE})`, { tone: 'success' });
      return true;
    },
    [compare, toast],
  );

  const clearCompare = useCallback(() => setCompare([]), []);

  /* -------------------------------------------------------------- bookings */

  const createBooking = useCallback(
    async (payload) => {
      const { data } = await api.createBooking(payload);
      setBookings((prev) => [data, ...prev]);
      toast(`Booking request sent — reference ${data.reference}`, { tone: 'success' });
      return data;
    },
    [toast],
  );

  const cancelBooking = useCallback(
    async (bookingId) => {
      const { data } = await api.cancelBooking(bookingId);
      setBookings(data);
      toast('Booking cancelled', { tone: 'default' });
    },
    [toast],
  );

  /* ------------------------------------------------------------------ chat */

  const openConversation = useCallback(async (vendorId) => {
    const { data } = await api.openConversation(vendorId);
    // Opening a thread clears its unread badge (update spec §7, §11).
    const read = data.unread ? { ...data, unread: 0 } : data;
    setConversations((prev) => ({ ...prev, [vendorId]: read }));
    return read;
  }, []);

  const sendMessage = useCallback(
    async (vendorId, text) => {
      const { data } = await api.sendMessage(vendorId, text);
      setConversations((prev) => ({ ...prev, [vendorId]: { ...data } }));
      // Production: this arrives as an inbound socket event instead.
      api.simulateVendorReply(vendorId).then(({ data: replied }) => {
        if (replied) setConversations((prev) => ({ ...prev, [vendorId]: { ...replied } }));
      });
    },
    [],
  );

  /* --------------------------------------------------------- notifications */

  const markNotificationRead = useCallback(async (id) => {
    const { data } = await api.markNotificationRead(id);
    setNotifications(data);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const { data } = await api.markAllNotificationsRead();
    setNotifications(data);
  }, []);

  /* -------------------------------------------------------------- settings */

  const updateSettings = useCallback(
    async (patch) => {
      const { data } = await api.saveSettings(patch);
      setSettings(data);
      return data;
    },
    [],
  );

  /**
   * Puts the demo back to its shipped state. Useful after a visitor has
   * cancelled bookings or emptied the wishlist while exploring.
   */
  const resetDemo = useCallback(async () => {
    await api.resetDemoData();
    setWishlist(readStorage(STORAGE_KEYS.wishlist, []));
    setBookings(readStorage(STORAGE_KEYS.bookings, []));
    setConversations(readStorage(STORAGE_KEYS.conversations, {}));
    setNotifications(readStorage(STORAGE_KEYS.notifications, []));
    setSettings({ ...api.DEFAULT_SETTINGS, ...readStorage(STORAGE_KEYS.settings, {}) });
    setCompare([...SEED_COMPARE]);
    toast('Demo data restored', { tone: 'success' });
  }, [toast]);

  /* ------------------------------------------------------------------ auth */

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.login(credentials);
      setUser(data);
      toast(`Welcome, ${data.name}`, { tone: 'success' });
      return data;
    },
    [toast],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    toast('You have been signed out');
  }, [toast]);

  /* --------------------------------------------------------------- filters */

  const setFilters = useCallback((patch) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({ ...INITIAL_FILTERS, location });
  }, [location]);

  const changeLocation = useCallback(
    (next) => {
      setLocation(next);
      setFiltersState((prev) => ({ ...prev, location: next }));
      writeStorage(STORAGE_KEYS.location, next);
    },
    [],
  );

  /* ---------------------------------------------------------------- modals */

  const openModal = useCallback((type, props = {}) => {
    setModals((prev) => [...prev, { type, props, key: `${type}-${Date.now()}` }]);
  }, []);

  const closeModal = useCallback(() => setModals((prev) => prev.slice(0, -1)), []);
  const closeAllModals = useCallback(() => setModals([]), []);

  /* --------------------------------------------------------------- derived */

  const wishlistVendors = useMemo(
    () => wishlist.map((id) => VENDORS.find((v) => v.id === id)).filter(Boolean),
    [wishlist],
  );

  const compareVendors = useMemo(
    () => compare.map((id) => VENDORS.find((v) => v.id === id)).filter(Boolean),
    [compare],
  );

  const conversationList = useMemo(
    () =>
      Object.values(conversations).sort((a, b) => {
        const at = (c) => c.messages.at(-1)?.at ?? '';
        return at(b).localeCompare(at(a));
      }),
    [conversations],
  );

  const unreadMessages = useMemo(
    () => conversationList.reduce((sum, c) => sum + (c.unread ?? 0), 0),
    [conversationList],
  );

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  /**
   * Who the dashboards are rendered for. Signing in is optional in this demo —
   * without a session the pre-populated demo customer is used, so the dashboard
   * is never an empty shell. No credential is checked either way (spec §19).
   */
  const dashboardUser = useMemo(() => user ?? DEMO_CUSTOMER, [user]);

  const value = useMemo(
    () => ({
      vendors: VENDORS,
      wishlist,
      wishlistVendors,
      isWishlisted,
      toggleWishlist,
      compare,
      compareVendors,
      isComparing,
      toggleCompare,
      clearCompare,
      maxCompare: MAX_COMPARE,
      bookings,
      createBooking,
      cancelBooking,
      conversations,
      conversationList,
      unreadMessages,
      openConversation,
      sendMessage,
      notifications,
      unreadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      settings,
      updateSettings,
      resetDemo,
      user,
      dashboardUser,
      login,
      logout,
      location,
      changeLocation,
      filters,
      setFilters,
      resetFilters,
      modals,
      openModal,
      closeModal,
      closeAllModals,
      toasts,
      toast,
      dismissToast,
    }),
    [
      wishlist, wishlistVendors, isWishlisted, toggleWishlist,
      compare, compareVendors, isComparing, toggleCompare, clearCompare,
      bookings, createBooking, cancelBooking,
      conversations, conversationList, unreadMessages, openConversation, sendMessage,
      notifications, unreadNotifications, markNotificationRead, markAllNotificationsRead,
      settings, updateSettings, resetDemo,
      user, dashboardUser, login, logout,
      location, changeLocation,
      filters, setFilters, resetFilters,
      modals, openModal, closeModal, closeAllModals,
      toasts, toast, dismissToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
