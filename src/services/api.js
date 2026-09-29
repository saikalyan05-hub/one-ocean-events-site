/**
 * SERVICE / API LAYER
 * -------------------
 * The single boundary between UI and persistence. Today every function resolves
 * against local demo data + localStorage; each one mirrors the REST endpoint it
 * will eventually call (spec §17), so swapping in a real backend means editing
 * only this file.
 *
 *   GET    /api/vendors                       -> listVendors
 *   GET    /api/vendors/:id                   -> getVendor
 *   GET    /api/categories                    -> listCategories
 *   GET    /api/wishlist                      -> getWishlist
 *   POST   /api/wishlist/:vendorId            -> toggleWishlist
 *   POST   /api/compare                       -> validateCompare
 *   GET    /api/bookings                      -> listBookings
 *   POST   /api/bookings                      -> createBooking
 *   GET    /api/conversations                 -> listConversations
 *   POST   /api/conversations/:id/messages    -> sendMessage
 *   POST   /api/auth/login                    -> login
 *   POST   /api/auth/logout                   -> logout
 *
 * Every call is async and returns the shape the REST API will return, so no
 * component has to change when DEMO_MODE is turned off.
 */

import { VENDORS, getVendorById } from '../data/vendors';
import { CATEGORIES, getCategoryById, vendorMatchesCategory } from '../data/categories';
import {
  ADMIN_ANNOUNCEMENTS,
  ADMIN_CUSTOMERS,
  ADMIN_DISABLED_VENDORS,
  ADMIN_OTHER_BOOKINGS,
  ADMIN_PENDING_VENDORS,
  ADMIN_REPORTS,
  ADMIN_REVIEW_QUEUE,
  ADMIN_STATS,
  DEMO_CUSTOMER,
  SEED_BOOKINGS,
  SEED_CONVERSATIONS,
  SEED_NOTIFICATIONS,
  SEED_WISHLIST,
} from '../data/demoData';
import { clearStorage, readStorage, writeStorage, STORAGE_KEYS } from '../utils/storage';

export const DEMO_MODE = true;

/** Maximum vendors in a comparison (spec §15). Enforced server-side in production. */
export const MAX_COMPARE = 3;

/** Simulated network latency so loading states are exercised in the demo. */
const latency = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* ------------------------------------------------------------------ seeding */

/**
 * Bump this when the shape or content of the seed changes; a visitor carrying an
 * older seed is re-seeded once, and anyone already on this version keeps the
 * wishlist, bookings and messages they created themselves.
 *
 * In production none of this exists: the server owns the data and the first
 * page load fetches it.
 */
const SEED_VERSION = 'v1-2026-09';

export const DEFAULT_SETTINGS = {
  emailUpdates: true,
  smsReminders: false,
  whatsappUpdates: true,
  showDemoBanners: true,
  /*
   * Platform switches on the admin Settings screen (update spec §13). They
   * live beside the customer preferences because the demo has one browser and
   * no server; in production these are org-level settings behind an admin role,
   * changed through an audited endpoint (§39).
   */
  adminAutoApproveVendors: false,
  adminModerateReviews: true,
  adminAcceptNewBookings: true,
  adminMaintenanceNotice: false,
};

const EMPTY_ADMIN_STATE = {
  vendorStatus: {},
  reviewStatus: {},
  customerStatus: {},
  // Field edits made on the admin customer screen, by customer id.
  customerEdits: {},
};

/**
 * Writes the shared demo model into storage on first run so no screen in the
 * demo opens empty (update spec §2, §24). Runs once per seed version.
 */
export function seedDemoData({ force = false } = {}) {
  if (!force && readStorage(STORAGE_KEYS.seed, null) === SEED_VERSION) return false;

  writeStorage(STORAGE_KEYS.wishlist, [...SEED_WISHLIST]);
  writeStorage(STORAGE_KEYS.bookings, SEED_BOOKINGS.map((b) => ({ ...b })));
  writeStorage(
    STORAGE_KEYS.conversations,
    Object.fromEntries(SEED_CONVERSATIONS.map((c) => [c.vendorId, c])),
  );
  writeStorage(STORAGE_KEYS.notifications, SEED_NOTIFICATIONS.map((n) => ({ ...n })));
  writeStorage(STORAGE_KEYS.settings, { ...DEFAULT_SETTINGS });
  writeStorage(STORAGE_KEYS.admin, structuredClone(EMPTY_ADMIN_STATE));
  writeStorage(STORAGE_KEYS.seed, SEED_VERSION);
  return true;
}

/** Wipes every local change and re-seeds. Offered on the settings screens. */
export async function resetDemoData() {
  clearStorage();
  seedDemoData({ force: true });
  return { data: true };
}

/* ------------------------------------------------------------------ vendors */

/**
 * GET /api/vendors
 * @param {{query?:string, categoryId?:string, location?:string, sort?:string}} params
 */
export async function listVendors(params = {}) {
  await latency();
  const { query = '', categoryId = null, location = null, sort = 'experience' } = params;

  const category = categoryId ? getCategoryById(categoryId) : null;
  const q = query.trim().toLowerCase();

  let results = VENDORS.filter((vendor) => {
    if (category && !vendorMatchesCategory(vendor, category)) return false;
    if (location && vendor.location !== location) return false;
    if (!q) return true;
    // Search matches vendor name or specialty (spec §11).
    return (
      vendor.facts.name.toLowerCase().includes(q) ||
      vendor.facts.specialty.toLowerCase().includes(q) ||
      vendor.facts.category.toLowerCase().includes(q)
    );
  });

  results = sortVendors(results, sort);
  return { data: results, total: results.length };
}

export function sortVendors(list, sort) {
  const sorted = [...list];
  switch (sort) {
    case 'name':
      return sorted.sort((a, b) =>
        a.facts.name.localeCompare(b.facts.name, undefined, { sensitivity: 'base' }),
      );
    case 'events':
      // Vendors with no supplied count sort last rather than being treated as zero.
      return sorted.sort((a, b) => (b.facts.eventCount ?? -1) - (a.facts.eventCount ?? -1));
    case 'experience':
    default:
      return sorted.sort((a, b) => b.facts.experienceYears - a.facts.experienceYears);
  }
}

/** GET /api/vendors/:id */
export async function getVendor(id) {
  await latency(120);
  const vendor = getVendorById(id);
  if (!vendor) {
    const error = new Error('Vendor not found');
    error.status = 404;
    throw error;
  }
  return { data: vendor };
}

/** GET /api/categories */
export async function listCategories() {
  await latency(80);
  return { data: CATEGORIES };
}

/* ----------------------------------------------------------------- wishlist */

/** GET /api/wishlist */
export async function getWishlist() {
  await latency(60);
  return { data: readStorage(STORAGE_KEYS.wishlist, []) };
}

/** POST /api/wishlist/:vendorId — toggles membership, returns the new list. */
export async function toggleWishlist(vendorId) {
  const current = readStorage(STORAGE_KEYS.wishlist, []);
  const exists = current.includes(vendorId);
  const next = exists ? current.filter((id) => id !== vendorId) : [...current, vendorId];
  writeStorage(STORAGE_KEYS.wishlist, next);
  return { data: next, added: !exists };
}

/* ------------------------------------------------------------------ compare */

/** POST /api/compare — validates a selection against the maximum. */
export async function validateCompare(vendorIds) {
  if (vendorIds.length > MAX_COMPARE) {
    const error = new Error(`You can compare up to ${MAX_COMPARE} vendors at a time.`);
    error.status = 422;
    throw error;
  }
  return { data: vendorIds };
}

/* ----------------------------------------------------------------- bookings */

/** GET /api/bookings */
export async function listBookings() {
  await latency(60);
  return { data: readStorage(STORAGE_KEYS.bookings, []) };
}

/**
 * POST /api/bookings
 * In production the server authorises the request, prices it and returns the
 * persisted row. Here we build the same shape locally.
 */
export async function createBooking(payload) {
  await latency(320);
  const vendor = getVendorById(payload.vendorId);
  if (!vendor) {
    const error = new Error('Vendor not found');
    error.status = 404;
    throw error;
  }

  const booking = {
    id: uid(),
    reference: `OOE-${Math.floor(100000 + Math.random() * 900000)}`,
    vendorId: vendor.id,
    vendorName: vendor.facts.name,
    vendorCategory: vendor.facts.category,
    vendorImage: vendor.image,
    eventDate: payload.eventDate,
    location: payload.location,
    guestCount: Number(payload.guestCount),
    eventType: payload.eventType,
    notes: payload.notes ?? '',
    status: 'Requested',
    // Demo estimate only — never presented as confirmed vendor pricing.
    estimate: estimateTotal(vendor, Number(payload.guestCount)),
    estimateIsDemo: true,
    createdAt: new Date().toISOString(),
  };

  const current = readStorage(STORAGE_KEYS.bookings, []);
  const next = [booking, ...current];
  writeStorage(STORAGE_KEYS.bookings, next);
  return { data: booking };
}

/** Demo-only estimate. Per-plate vendors scale by guests; others are flat. */
function estimateTotal(vendor, guestCount) {
  const { startingPrice, priceUnit } = vendor.demo;
  if (!startingPrice) return null;
  if (priceUnit === 'plate' && Number.isFinite(guestCount)) return startingPrice * guestCount;
  return startingPrice;
}

export async function cancelBooking(bookingId) {
  const current = readStorage(STORAGE_KEYS.bookings, []);
  const next = current.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
  writeStorage(STORAGE_KEYS.bookings, next);
  return { data: next };
}

/* --------------------------------------------------------------------- chat */

const seededConversation = (vendor) => ({
  id: `conv-${vendor.id}`,
  vendorId: vendor.id,
  vendorName: vendor.facts.name,
  vendorImage: vendor.image,
  messages: [
    {
      id: uid(),
      author: 'vendor',
      text: `Hello! Thanks for reaching out to ${vendor.facts.name}. How can we help with your event?`,
      at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
    {
      id: uid(),
      author: 'customer',
      text: 'Hi! I am planning an event and wanted to check your availability.',
      at: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    },
    {
      id: uid(),
      author: 'vendor',
      text: 'Happy to help. Share your event date and guest count and we will send a quote.',
      at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
  ],
});

/** GET /api/conversations */
export async function listConversations() {
  await latency(60);
  return { data: readStorage(STORAGE_KEYS.conversations, {}) };
}

/** Opens (and seeds, on first visit) the conversation with a vendor. */
export async function openConversation(vendorId) {
  const vendor = getVendorById(vendorId);
  if (!vendor) {
    const error = new Error('Vendor not found');
    error.status = 404;
    throw error;
  }
  const all = readStorage(STORAGE_KEYS.conversations, {});
  if (!all[vendorId]) all[vendorId] = seededConversation(vendor);
  // Reading a thread clears its unread badge, and that has to survive a reload.
  if (all[vendorId].unread) all[vendorId] = { ...all[vendorId], unread: 0 };
  writeStorage(STORAGE_KEYS.conversations, all);
  return { data: all[vendorId] };
}

/**
 * POST /api/conversations/:id/messages
 * Production replaces this with a Socket.IO emit; the UI contract is identical.
 */
export async function sendMessage(vendorId, text) {
  const all = readStorage(STORAGE_KEYS.conversations, {});
  const conversation = all[vendorId];
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.status = 404;
    throw error;
  }
  conversation.messages.push({
    id: uid(),
    author: 'customer',
    text,
    at: new Date().toISOString(),
  });
  writeStorage(STORAGE_KEYS.conversations, all);
  return { data: conversation };
}

/** Demo stand-in for an inbound socket event. */
export async function simulateVendorReply(vendorId) {
  await latency(1100);
  const all = readStorage(STORAGE_KEYS.conversations, {});
  const conversation = all[vendorId];
  if (!conversation) return { data: null };
  conversation.messages.push({
    id: uid(),
    author: 'vendor',
    text: 'Thanks for the details! Our team will confirm availability and share a quote shortly.',
    at: new Date().toISOString(),
    demo: true,
  });
  writeStorage(STORAGE_KEYS.conversations, all);
  return { data: conversation };
}

/* --------------------------------------------------------------------- auth */

/**
 * POST /api/auth/login
 * Demo-only: accepts any well-formed name/email and stores a local session flag.
 * No credential is checked and nothing is transmitted. Production must call a
 * real endpoint that sets an HTTP-only cookie and returns the user record.
 */
export async function login({ name, email }) {
  await latency(400);
  const user = {
    id: uid(),
    name: name?.trim() || email.split('@')[0],
    email: email.trim(),
    role: 'customer',
    demo: true,
    signedInAt: new Date().toISOString(),
  };
  writeStorage(STORAGE_KEYS.auth, user);
  return { data: user };
}

/** POST /api/auth/logout */
export async function logout() {
  writeStorage(STORAGE_KEYS.auth, null);
  return { data: null };
}

export async function getSession() {
  return { data: readStorage(STORAGE_KEYS.auth, null) };
}

/* ------------------------------------------------------------ notifications */

/** GET /api/notifications */
export async function listNotifications() {
  await latency(60);
  return { data: readStorage(STORAGE_KEYS.notifications, []) };
}

/** POST /api/notifications/:id/read */
export async function markNotificationRead(id) {
  const all = readStorage(STORAGE_KEYS.notifications, []);
  const next = all.map((n) => (n.id === id ? { ...n, read: true } : n));
  writeStorage(STORAGE_KEYS.notifications, next);
  return { data: next };
}

/** POST /api/notifications/read-all */
export async function markAllNotificationsRead() {
  const all = readStorage(STORAGE_KEYS.notifications, []);
  const next = all.map((n) => ({ ...n, read: true }));
  writeStorage(STORAGE_KEYS.notifications, next);
  return { data: next };
}

/* ----------------------------------------------------------------- settings */

/** GET /api/me/settings */
export async function getSettings() {
  await latency(50);
  return { data: { ...DEFAULT_SETTINGS, ...readStorage(STORAGE_KEYS.settings, {}) } };
}

/** PATCH /api/me/settings */
export async function saveSettings(patch) {
  const next = { ...DEFAULT_SETTINGS, ...readStorage(STORAGE_KEYS.settings, {}), ...patch };
  writeStorage(STORAGE_KEYS.settings, next);
  return { data: next };
}

/* -------------------------------------------------------------------- admin */

/*
 * Admin endpoints exist so the demo can show an operations view. In production
 * every one of these is authorised server-side against an admin role — none of
 * this logic may stay in the browser bundle (spec §39).
 *
 *   GET   /api/admin/overview            -> getAdminOverview
 *   GET   /api/admin/bookings            -> listAdminBookings
 *   GET   /api/admin/customers           -> listAdminCustomers
 *   PATCH /api/admin/customers/:id       -> updateCustomer
 *   GET   /api/admin/vendors             -> listAdminVendors
 *   PATCH /api/admin/vendors/:id/status  -> setVendorStatus
 *   GET   /api/admin/reviews             -> listAdminReviews
 *   PATCH /api/admin/reviews/:id/status  -> setReviewStatus
 *   GET   /api/admin/announcements       -> listAnnouncements
 *   GET   /api/admin/reports             -> getReports
 */

const readAdminState = () => ({
  ...EMPTY_ADMIN_STATE,
  ...readStorage(STORAGE_KEYS.admin, {}),
});

const writeAdminState = (patch) => {
  const next = { ...readAdminState(), ...patch };
  writeStorage(STORAGE_KEYS.admin, next);
  return next;
};

/** The customer's own bookings, expressed as admin table rows. */
function ownBookingsAsAdminRows() {
  return readStorage(STORAGE_KEYS.bookings, []).map((b) => ({
    id: b.id,
    reference: b.reference,
    customerId: DEMO_CUSTOMER.id,
    customerName: DEMO_CUSTOMER.name,
    vendorId: b.vendorId,
    eventType: b.eventType,
    eventDate: b.eventDate,
    guestCount: b.guestCount,
    amount: b.estimate,
    status: b.status === 'Requested' ? 'Pending' : b.status,
    live: true,
  }));
}

/**
 * GET /api/admin/bookings
 * Merges the visitor's real (local) bookings with the other customers' demo
 * rows, so a cancellation made on the customer side is visible here too
 * (update spec §25).
 */
export async function listAdminBookings() {
  await latency(90);
  const rows = [...ownBookingsAsAdminRows(), ...ADMIN_OTHER_BOOKINGS].map((row) => {
    const vendor = getVendorById(row.vendorId);
    return {
      ...row,
      vendorName: vendor?.facts.name ?? 'Unknown vendor',
      vendorCategory: vendor?.facts.category ?? null,
      vendorImage: vendor?.image ?? null,
    };
  });
  rows.sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1));
  return { data: rows };
}

/** GET /api/admin/customers */
export async function listAdminCustomers() {
  await latency(70);
  const { customerStatus, customerEdits } = readAdminState();
  const liveBookings = readStorage(STORAGE_KEYS.bookings, []).length;
  const data = ADMIN_CUSTOMERS.map((c) => ({
    ...c,
    ...(customerEdits[c.id] ?? {}),
    // The demo customer's booking count tracks what is actually in storage.
    bookings: c.id === DEMO_CUSTOMER.id ? liveBookings : c.bookings,
    status: customerStatus[c.id] ?? c.status,
  }));
  return { data };
}

/**
 * PATCH /api/admin/customers/:id
 *
 * Only the three contact fields an operator would plausibly correct. Booking
 * counts are derived and status has its own endpoint, so neither is writable
 * here — an edit form that can silently rewrite a derived number is a way to
 * make two screens disagree. In production this is an authorised call that
 * writes an audit record naming who changed what (spec §39).
 */
export async function updateCustomer(customerId, patch) {
  await latency(120);
  const allowed = ['name', 'email', 'location'];
  const clean = {};
  for (const key of allowed) {
    if (typeof patch?.[key] === 'string' && patch[key].trim()) clean[key] = patch[key].trim();
  }
  const state = readAdminState();
  writeAdminState({
    customerEdits: {
      ...state.customerEdits,
      [customerId]: { ...(state.customerEdits[customerId] ?? {}), ...clean },
    },
  });
  return listAdminCustomers();
}

/** PATCH /api/admin/customers/:id/status */
export async function setCustomerStatus(customerId, status) {
  const state = readAdminState();
  writeAdminState({ customerStatus: { ...state.customerStatus, [customerId]: status } });
  return listAdminCustomers();
}

const PENDING_BY_ID = Object.fromEntries(ADMIN_PENDING_VENDORS.map((v) => [v.vendorId, v]));

/** GET /api/admin/vendors */
export async function listAdminVendors() {
  await latency(90);
  const { vendorStatus } = readAdminState();
  const data = VENDORS.map((vendor) => {
    const base = PENDING_BY_ID[vendor.id]
      ? 'Pending'
      : ADMIN_DISABLED_VENDORS.includes(vendor.id)
        ? 'Disabled'
        : 'Active';
    return {
      id: vendor.id,
      name: vendor.facts.name,
      category: vendor.facts.category,
      experienceYears: vendor.facts.experienceYears,
      experienceLabel: vendor.facts.experienceLabel ?? `${vendor.facts.experienceYears} years`,
      eventCountLabel: vendor.facts.eventCountLabel,
      location: vendor.location,
      image: vendor.image,
      sample: Boolean(vendor.sample),
      submitted: PENDING_BY_ID[vendor.id]?.submitted ?? null,
      status: vendorStatus[vendor.id] ?? base,
    };
  });
  return { data };
}

/** PATCH /api/admin/vendors/:id/status — Active | Pending | Disabled */
export async function setVendorStatus(vendorId, status) {
  const state = readAdminState();
  writeAdminState({ vendorStatus: { ...state.vendorStatus, [vendorId]: status } });
  return listAdminVendors();
}

/** GET /api/admin/reviews — demo reviews awaiting moderation. Never real ones. */
export async function listAdminReviews() {
  await latency(70);
  const { reviewStatus } = readAdminState();
  const data = ADMIN_REVIEW_QUEUE.map((review) => {
    const vendor = getVendorById(review.vendorId);
    return {
      ...review,
      vendorName: vendor?.facts.name ?? 'Unknown vendor',
      vendorImage: vendor?.image ?? null,
      status: reviewStatus[review.id] ?? review.status,
      demo: true,
    };
  });
  return { data };
}

/** PATCH /api/admin/reviews/:id/status — Pending | Approved | Hidden */
export async function setReviewStatus(reviewId, status) {
  const state = readAdminState();
  writeAdminState({ reviewStatus: { ...state.reviewStatus, [reviewId]: status } });
  return listAdminReviews();
}

/** GET /api/admin/announcements */
export async function listAnnouncements() {
  await latency(60);
  return { data: ADMIN_ANNOUNCEMENTS };
}

/** GET /api/admin/reports */
export async function getReports() {
  await latency(120);
  return { data: ADMIN_REPORTS };
}

/**
 * GET /api/admin/overview
 * The headline figures are demo constants, not counts of anything in this
 * bundle; the screen labels them as such (update spec §14).
 */
export async function getAdminOverview() {
  await latency(120);
  const [{ data: bookings }, { data: vendors }, { data: reviews }] = await Promise.all([
    listAdminBookings(),
    listAdminVendors(),
    listAdminReviews(),
  ]);
  return {
    data: {
      stats: ADMIN_STATS,
      recentBookings: bookings.slice(0, 5),
      newVendors: vendors.filter((v) => v.status === 'Pending').slice(0, 4),
      recentReviews: reviews.slice(0, 4),
    },
  };
}
