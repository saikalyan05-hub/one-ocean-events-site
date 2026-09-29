import { getVendorById } from './vendors';

/**
 * SHARED DEMO DATA MODEL
 * ----------------------
 * One source for every pre-populated screen in the demo (update spec §25).
 *
 * Nothing here describes a real person, a real booking or a real business
 * transaction. The customer, the admin, the other customers, the amounts and
 * the platform statistics are all invented so the interface has something to
 * show. Every screen that renders these values labels them as demo data.
 *
 * Consistency rule: bookings, conversations and admin rows all reference
 * vendors by id and read their name and image back from `vendors.js`. A vendor
 * therefore cannot appear under two different names on two different screens,
 * and cancelling a booking as the customer changes what the admin sees.
 */

export const DEMO_DATA_NOTICE =
  'Demo data — invented for this prototype. No real customer, booking or payment is represented.';

/* ------------------------------------------------------------ time helpers */

const now = Date.now();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const minsAgo = (n) => new Date(now - n * MIN).toISOString();
const hoursAgo = (n) => new Date(now - n * HOUR).toISOString();
const daysAgo = (n) => new Date(now - n * DAY).toISOString();

/* -------------------------------------------------------- the demo customer */

/**
 * The signed-in customer used when someone browses the demo without logging in
 * themselves. Named rather than "Demo User" so the dashboard reads naturally
 * (update spec §2), but flagged `demo: true` everywhere it is stored.
 */
export const DEMO_CUSTOMER = {
  id: 'cust-rahul-sharma',
  name: 'Rahul Sharma',
  firstName: 'Rahul',
  email: 'rahul.sharma@example.com',
  phone: '+91 98XXX XXX01',
  location: 'Hyderabad',
  role: 'customer',
  memberSince: '2025-11-02',
  demo: true,
};

/** The admin account behind /admin. Same story: invented, clearly flagged. */
export const DEMO_ADMIN = {
  id: 'admin-one-ocean',
  name: 'Admin',
  email: 'admin@oneoceanevents.example',
  role: 'admin',
  demo: true,
};

/* ------------------------------------------------------------- the wishlist */

/** Eight saved vendors, spread across categories (update spec §7, §9). */
export const SEED_WISHLIST = [
  'sln-decorators',
  'sri-mallikarjuna-flower-decoration',
  'aakriti-wedding-decor',
  'sreenidhi-fresh-flowers',
  'godavari-ruchulu-catering',
  'frameworks-wedding-photography',
  'henna-by-divya',
  'lakeview-garden-resort',
];

/** Three caterers pre-loaded into the comparison tray (update spec §10). */
export const SEED_COMPARE = [
  'amogham-caterers-narasimha',
  'savyasachi-caterers',
  'ashta-lakshmi-catering',
];

/* -------------------------------------------------------------- the bookings */

/**
 * Builds a booking row in exactly the shape `api.createBooking` returns, so a
 * seeded booking and one the visitor makes themselves are indistinguishable to
 * every component downstream.
 */
const booking = ({ ref, vendorId, eventType, eventDate, guests, status, notes, createdAt }) => {
  const vendor = getVendorById(vendorId);
  if (!vendor) return null;
  const { startingPrice, priceUnit } = vendor.demo;
  const estimate =
    priceUnit === 'plate' || priceUnit === 'guest' ? startingPrice * guests : startingPrice;
  return {
    id: `seed-${ref.toLowerCase()}`,
    reference: `OOE-${ref}`,
    vendorId: vendor.id,
    vendorName: vendor.facts.name,
    vendorCategory: vendor.facts.category,
    vendorImage: vendor.image,
    eventDate,
    location: vendor.location,
    guestCount: guests,
    eventType,
    notes: notes ?? '',
    status,
    estimate,
    estimateIsDemo: true,
    createdAt,
    seeded: true,
  };
};

/**
 * Rahul's bookings: three upcoming, two completed, one cancelled — enough for
 * every tab on the bookings page to have content (update spec §8, §24).
 */
export const SEED_BOOKINGS = [
  booking({
    ref: '482190',
    vendorId: 'dhruva-events-decors',
    eventType: 'Wedding',
    eventDate: '2026-10-25',
    guests: 200,
    status: 'Confirmed',
    notes: 'Floral theme for the mandap, pastel palette for the reception stage.',
    createdAt: daysAgo(21),
  }),
  booking({
    ref: '482206',
    vendorId: 'amogham-caterers-narasimha',
    eventType: 'Wedding',
    eventDate: '2026-10-25',
    guests: 200,
    status: 'Confirmed',
    notes: 'Separate pure-veg counter for the bride’s family.',
    createdAt: daysAgo(19),
  }),
  booking({
    ref: '483341',
    vendorId: 'little-star-birthday-planners',
    eventType: 'Birthday party',
    eventDate: '2026-11-14',
    guests: 40,
    status: 'Pending',
    notes: 'Space theme, cake table for a 6th birthday.',
    createdAt: daysAgo(4),
  }),
  booking({
    ref: '461028',
    vendorId: 'sri-mallikarjuna-flower-decoration',
    eventType: 'Engagement',
    eventDate: '2026-06-12',
    guests: 150,
    status: 'Completed',
    notes: 'Fresh jasmine and rose stage decor.',
    createdAt: daysAgo(132),
  }),
  booking({
    ref: '461035',
    vendorId: 'frameworks-wedding-photography',
    eventType: 'Engagement',
    eventDate: '2026-06-12',
    guests: 150,
    status: 'Completed',
    notes: 'Candid coverage plus a short film.',
    createdAt: daysAgo(130),
  }),
  booking({
    ref: '470774',
    vendorId: 'meridian-corporate-events',
    eventType: 'Corporate event',
    eventDate: '2026-08-02',
    guests: 120,
    status: 'Cancelled',
    notes: 'Team offsite — postponed to next quarter.',
    createdAt: daysAgo(80),
  }),
].filter(Boolean);

/* --------------------------------------------------------- the conversations */

const thread = ({ vendorId, unread = 0, messages }) => {
  const vendor = getVendorById(vendorId);
  if (!vendor) return null;
  return {
    id: `conv-${vendor.id}`,
    vendorId: vendor.id,
    vendorName: vendor.facts.name,
    vendorImage: vendor.image,
    unread,
    seeded: true,
    messages: messages.map(([author, text, at], i) => ({
      id: `seed-${vendor.id}-${i}`,
      author,
      text,
      at,
      demo: true,
    })),
  };
};

/** Four threads, four unread messages between them (update spec §7, §11). */
export const SEED_CONVERSATIONS = [
  thread({
    vendorId: 'dhruva-events-decors',
    unread: 1,
    messages: [
      ['customer', 'Hi, I am looking for wedding decoration on 25 October.', daysAgo(6)],
      [
        'vendor',
        'Hello Rahul! That date is available. What theme are you thinking of?',
        daysAgo(6),
      ],
      ['customer', 'We would like a floral theme with pastel colours.', daysAgo(6)],
      [
        'vendor',
        'Lovely choice. We can do a fresh flower mandap with a pastel reception stage. Shall I share a few reference photos?',
        daysAgo(5),
      ],
      ['customer', 'Yes please, and an estimate for around 200 guests.', daysAgo(5)],
      [
        'vendor',
        'Sent the references to your email. The setup team will arrive by 6am on the day to finish before the muhurtham.',
        hoursAgo(3),
      ],
    ],
  }),
  thread({
    vendorId: 'amogham-caterers-narasimha',
    unread: 2,
    messages: [
      ['customer', 'Can you do a separate pure-veg counter alongside the main menu?', daysAgo(4)],
      [
        'vendor',
        'Yes, we run a fully separate veg line with its own staff and serving ware.',
        daysAgo(4),
      ],
      ['customer', 'Perfect. Could you share the tasting session dates?', daysAgo(2)],
      ['vendor', 'Tasting slots are open this Saturday and Sunday morning.', hoursAgo(20)],
      ['vendor', 'Would 11am on Saturday suit you?', hoursAgo(5)],
    ],
  }),
  thread({
    vendorId: 'henna-by-divya',
    unread: 1,
    messages: [
      ['customer', 'Do you have artists available for guests as well as the bride?', daysAgo(9)],
      [
        'vendor',
        'Yes — we usually bring three extra artists for a guest count of about thirty.',
        daysAgo(9),
      ],
      ['customer', 'That works. The mehendi is on the 24th, the day before the wedding.', daysAgo(8)],
      ['vendor', 'Pencilled in for the 24th. I will confirm the artist list a week before.', minsAgo(90)],
    ],
  }),
  thread({
    vendorId: 'lakeview-garden-resort',
    unread: 0,
    messages: [
      ['customer', 'Is the lawn available for a reception in November?', daysAgo(12)],
      ['vendor', 'The first two weekends of November are open at the moment.', daysAgo(12)],
      ['customer', 'Thank you, I will check with family and come back to you.', daysAgo(11)],
    ],
  }),
].filter(Boolean);

/* -------------------------------------------------------- the notifications */

/**
 * Five notifications (update spec §12). `icon` names come from the shared Icon
 * set so the dashboard uses the same glyphs as the rest of the site.
 */
export const SEED_NOTIFICATIONS = [
  {
    id: 'ntf-1',
    type: 'booking',
    icon: 'checkCircle',
    tone: 'teal',
    title: 'Booking confirmed',
    text: 'DHRUVA EVENTS & DECORS confirmed your wedding decoration for 25 October.',
    at: hoursAgo(3),
    read: false,
    to: '/dashboard/bookings',
  },
  {
    id: 'ntf-2',
    type: 'message',
    icon: 'chat',
    tone: 'sky',
    title: 'New message',
    text: 'Amogham caterers by Narasimha suggested a tasting slot on Saturday at 11am.',
    at: hoursAgo(5),
    read: false,
    to: '/dashboard/messages',
  },
  {
    id: 'ntf-3',
    type: 'wishlist',
    icon: 'heart',
    tone: 'coral',
    title: 'Vendor saved',
    text: 'Lakeview Garden Resort was added to your wishlist.',
    at: daysAgo(1),
    read: false,
    to: '/dashboard/wishlist',
  },
  {
    id: 'ntf-4',
    type: 'reminder',
    icon: 'calendar',
    tone: 'orange',
    title: 'Event reminder',
    text: 'Your wedding is 26 days away. Two vendors are still awaiting confirmation.',
    at: daysAgo(2),
    read: true,
    to: '/dashboard/bookings',
  },
  {
    id: 'ntf-5',
    type: 'review',
    icon: 'star',
    tone: 'lavender',
    title: 'Review reminder',
    text: "How was Sri mallikarjuna flower decoration's at your engagement? Leave a review.",
    at: daysAgo(6),
    read: true,
    to: '/dashboard/bookings',
  },
];

/* ------------------------------------------------------- saved searches etc */

export const SEED_SAVED_SEARCHES = [
  { id: 'ss-1', label: 'Wedding decorators in Hyderabad', categoryId: 'wedding-decoration', location: 'Hyderabad', query: '' },
  { id: 'ss-2', label: 'Pure veg caterers', categoryId: 'catering-services', location: 'Hyderabad', query: 'pure veg' },
  { id: 'ss-3', label: 'Outdoor venues', categoryId: 'venues', location: 'Hyderabad', query: '' },
];

/** Reviews Rahul has written. Demo content, shown with a demo tag. */
export const SEED_MY_REVIEWS = [
  {
    id: 'myrev-1',
    vendorId: 'sri-mallikarjuna-flower-decoration',
    rating: 5,
    text: 'The jasmine work at our engagement was beautiful and arrived on time.',
    at: daysAgo(100),
    demo: true,
  },
  {
    id: 'myrev-2',
    vendorId: 'frameworks-wedding-photography',
    rating: 5,
    text: 'The teaser film was ready the same evening. Everyone in the family shared it.',
    at: daysAgo(96),
    demo: true,
  },
];

/** "Your Recent Activity" feed on the dashboard home (update spec §7). */
export const SEED_ACTIVITY = [
  { id: 'act-1', icon: 'heart', tone: 'coral', text: 'You added SLN decorators to your wishlist.', at: hoursAgo(9) },
  { id: 'act-2', icon: 'scale', tone: 'lavender', text: 'You compared 3 caterers side by side.', at: daysAgo(1) },
  { id: 'act-3', icon: 'calendar', tone: 'teal', text: 'You booked DHRUVA EVENTS & DECORS for your wedding.', at: daysAgo(3) },
  { id: 'act-4', icon: 'chat', tone: 'sky', text: 'You received a message from Amogham caterers by Narasimha.', at: daysAgo(4) },
  { id: 'act-5', icon: 'pin', tone: 'orange', text: 'You saved Lakeview Garden Resort as a possible venue.', at: daysAgo(6) },
];

/* ============================================================== ADMIN SIDE == */

/**
 * Platform statistics for the admin home (update spec §14).
 * THESE ARE DEMO NUMBERS. They are not measurements of anything; the admin
 * screen states that above the grid.
 */
export const ADMIN_STATS = [
  { id: 'customers', icon: 'users', tone: 'sky', label: 'Customers', value: '1,248' },
  { id: 'vendors', icon: 'store', tone: 'teal', label: 'Vendors', value: '186' },
  { id: 'bookings', icon: 'calendar', tone: 'coral', label: 'Bookings', value: '324' },
  { id: 'revenue', icon: 'chart', tone: 'orange', label: 'Demo Revenue', value: '₹8.4L' },
  { id: 'reviews', icon: 'star', tone: 'lavender', label: 'Reviews', value: '742' },
  { id: 'messages', icon: 'chat', tone: 'sky', label: 'Messages', value: '96' },
];

/** Customer directory for admin (update spec §16). All invented. */
export const ADMIN_CUSTOMERS = [
  { id: 'cust-rahul-sharma', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', location: 'Hyderabad', bookings: 6, status: 'Active', joined: '2025-11-02' },
  { id: 'cust-priya-reddy', name: 'Priya Reddy', email: 'priya.reddy@example.com', location: 'Hyderabad', bookings: 3, status: 'Active', joined: '2026-01-18' },
  { id: 'cust-arjun-kumar', name: 'Arjun Kumar', email: 'arjun.kumar@example.com', location: 'Bengaluru', bookings: 4, status: 'Active', joined: '2025-08-27' },
  { id: 'cust-sneha-iyer', name: 'Sneha Iyer', email: 'sneha.iyer@example.com', location: 'Chennai', bookings: 2, status: 'Active', joined: '2026-03-05' },
  { id: 'cust-mohit-agarwal', name: 'Mohit Agarwal', email: 'mohit.agarwal@example.com', location: 'Hyderabad', bookings: 1, status: 'Active', joined: '2026-05-21' },
  { id: 'cust-fatima-begum', name: 'Fatima Begum', email: 'fatima.begum@example.com', location: 'Hyderabad', bookings: 5, status: 'Active', joined: '2025-06-14' },
  { id: 'cust-vikram-rao', name: 'Vikram Rao', email: 'vikram.rao@example.com', location: 'Visakhapatnam', bookings: 2, status: 'Disabled', joined: '2025-09-30' },
  { id: 'cust-ananya-das', name: 'Ananya Das', email: 'ananya.das@example.com', location: 'Vijayawada', bookings: 3, status: 'Active', joined: '2026-02-11' },
];

/**
 * Bookings belonging to customers other than Rahul (update spec §14, §17).
 * Rahul's own bookings are NOT duplicated here — the admin screen merges the
 * live booking list so a cancellation made as the customer shows up as a
 * cancellation in admin.
 */
export const ADMIN_OTHER_BOOKINGS = [
  { id: 'adm-b1', reference: 'OOE-482311', customerId: 'cust-priya-reddy', customerName: 'Priya Reddy', vendorId: 'amogham-caterers-narasimha', eventType: 'Engagement', eventDate: '2026-11-08', guestCount: 120, amount: 60000, status: 'Pending' },
  { id: 'adm-b2', reference: 'OOE-482298', customerId: 'cust-arjun-kumar', customerName: 'Arjun Kumar', vendorId: 'sln-decorators', eventType: 'Corporate event', eventDate: '2026-10-30', guestCount: 400, amount: 55000, status: 'Confirmed' },
  { id: 'adm-b3', reference: 'OOE-482355', customerId: 'cust-sneha-iyer', customerName: 'Sneha Iyer', vendorId: 'swaralaya-music-ensemble', eventType: 'Wedding', eventDate: '2026-12-04', guestCount: 300, amount: 55000, status: 'Confirmed' },
  { id: 'adm-b4', reference: 'OOE-481902', customerId: 'cust-fatima-begum', customerName: 'Fatima Begum', vendorId: 'nizami-dawat-caterers', eventType: 'Reception', eventDate: '2026-11-22', guestCount: 500, amount: 390000, status: 'Confirmed' },
  { id: 'adm-b5', reference: 'OOE-479120', customerId: 'cust-mohit-agarwal', customerName: 'Mohit Agarwal', vendorId: 'little-star-birthday-planners', eventType: 'Birthday party', eventDate: '2026-09-12', guestCount: 35, amount: 18000, status: 'Completed' },
  { id: 'adm-b6', reference: 'OOE-478844', customerId: 'cust-ananya-das', customerName: 'Ananya Das', vendorId: 'pushpanjali-florists', eventType: 'Housewarming', eventDate: '2026-08-29', guestCount: 80, amount: 18000, status: 'Completed' },
  { id: 'adm-b7', reference: 'OOE-480013', customerId: 'cust-vikram-rao', customerName: 'Vikram Rao', vendorId: 'aperture-tales', eventType: 'Wedding', eventDate: '2026-09-05', guestCount: 200, amount: 60000, status: 'Cancelled' },
  { id: 'adm-b8', reference: 'OOE-482401', customerId: 'cust-priya-reddy', customerName: 'Priya Reddy', vendorId: 'glow-bridal-studio', eventType: 'Engagement', eventDate: '2026-11-08', guestCount: 4, amount: 22000, status: 'Pending' },
];

/** Vendors awaiting approval on the admin home (update spec §14, §15). */
export const ADMIN_PENDING_VENDORS = [
  { vendorId: 'blue-lotus-event-styling', submitted: daysAgo(2), status: 'Pending' },
  { vendorId: 'giftwala-curations', submitted: daysAgo(4), status: 'Pending' },
  { vendorId: 'aperture-tales', submitted: daysAgo(6), status: 'Pending' },
  { vendorId: 'confetti-kids-events', submitted: daysAgo(9), status: 'Pending' },
];

/** Vendors an admin has disabled. Drives the Status column in §15. */
export const ADMIN_DISABLED_VENDORS = ['beatbox-sound-and-light'];

/**
 * Review moderation queue (update spec §18).
 * These are DEMO reviews. The admin screen says so above the table and never
 * presents them as genuine customer feedback.
 */
export const ADMIN_REVIEW_QUEUE = [
  { id: 'rq-1', vendorId: 'dhruva-events-decors', author: 'Priya Reddy', rating: 5, text: 'The mandap was set up well before the muhurtham and looked exactly like the reference.', at: daysAgo(1), status: 'Pending' },
  { id: 'rq-2', vendorId: 'nizami-dawat-caterers', author: 'Fatima Begum', rating: 5, text: 'Biryani cooked on site. The veg counter was kept properly separate.', at: daysAgo(2), status: 'Pending' },
  { id: 'rq-3', vendorId: 'sln-decorators', author: 'Arjun Kumar', rating: 3, text: 'Good scale of work but the team arrived later than agreed.', at: daysAgo(3), status: 'Pending' },
  { id: 'rq-4', vendorId: 'henna-by-divya', author: 'Sneha Iyer', rating: 5, text: 'Colour came out deep by the next morning and lasted three weeks.', at: daysAgo(5), status: 'Approved' },
  { id: 'rq-5', vendorId: 'little-star-birthday-planners', author: 'Mohit Agarwal', rating: 4, text: 'Kept twenty five children entertained for three hours.', at: daysAgo(7), status: 'Approved' },
  { id: 'rq-6', vendorId: 'beatbox-sound-and-light', author: 'Vikram Rao', rating: 1, text: 'Contact me on my personal number for a cheaper deal outside the platform.', at: daysAgo(8), status: 'Hidden' },
];

/** Announcements shown in the admin Announcements screen (update spec §13). */
export const ADMIN_ANNOUNCEMENTS = [
  { id: 'ann-1', title: 'Festive season vendor onboarding', body: 'Onboarding for the October to December festive season closes on 10 October. Vendors joining after that date will be listed from January.', audience: 'Vendors', at: daysAgo(2), status: 'Published' },
  { id: 'ann-2', title: 'Wedding season booking window open', body: 'Customers can now book vendors for dates up to June 2027. Popular decorators and caterers fill up first.', audience: 'Customers', at: daysAgo(8), status: 'Published' },
  { id: 'ann-3', title: 'Updated cancellation guidance', body: 'Draft copy explaining the notice period for cancellations. Awaiting review before it goes out.', audience: 'Everyone', at: daysAgo(1), status: 'Draft' },
];

/**
 * Simple report series (update spec §19). Plain numbers rendered as bars — no
 * financial analytics, no charting library.
 */
export const ADMIN_REPORTS = {
  bookingsThisMonth: {
    title: 'Bookings this month',
    unit: 'bookings',
    series: [
      { label: 'Week 1', value: 18 },
      { label: 'Week 2', value: 27 },
      { label: 'Week 3', value: 34 },
      { label: 'Week 4', value: 22 },
    ],
  },
  popularCategories: {
    title: 'Popular categories',
    unit: 'bookings',
    series: [
      { label: 'Wedding Decoration', value: 96 },
      { label: 'Catering Services', value: 84 },
      { label: 'Photography', value: 47 },
      { label: 'Venues', value: 39 },
      { label: 'Entertainment', value: 31 },
      { label: 'Birthday Parties', value: 27 },
    ],
  },
  vendorGrowth: {
    title: 'Vendor growth',
    unit: 'vendors',
    series: [
      { label: 'Apr', value: 128 },
      { label: 'May', value: 139 },
      { label: 'Jun', value: 151 },
      { label: 'Jul', value: 162 },
      { label: 'Aug', value: 174 },
      { label: 'Sep', value: 186 },
    ],
  },
  customerGrowth: {
    title: 'Customer growth',
    unit: 'customers',
    series: [
      { label: 'Apr', value: 742 },
      { label: 'May', value: 836 },
      { label: 'Jun', value: 948 },
      { label: 'Jul', value: 1042 },
      { label: 'Aug', value: 1157 },
      { label: 'Sep', value: 1248 },
    ],
  },
};
