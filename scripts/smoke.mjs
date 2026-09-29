/**
 * Runtime smoke test.
 *
 * Mounts the real app in jsdom through Vite's SSR module loader, walks every
 * route, opens every modal and exercises wishlist / compare / booking / chat.
 * It catches crashes and broken props that a bundle-only build cannot.
 *
 * Run with: npm run smoke
 */
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

/* ------------------------------------------------------------ dom setup */

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
// Node 21+ defines navigator as a getter-only global; redefine rather than assign.
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
});
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.Event = dom.window.Event;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.KeyboardEvent = dom.window.KeyboardEvent;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no layout engine, so ResizeObserver and scrollTo are no-ops here.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
dom.window.ResizeObserver = globalThis.ResizeObserver;
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

/* --------------------------------------------------------------- errors */

const problems = [];
const realError = console.error;
console.error = (...args) => {
  problems.push(args.map(String).join(' '));
  realError(...args);
};
dom.window.addEventListener('error', (e) => problems.push(`window error: ${e.message}`));
process.on('unhandledRejection', (reason) => problems.push(`unhandled rejection: ${reason}`));

/* ----------------------------------------------------------------- run */

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const checks = [];
const check = (name, ok, detail = '') => {
  checks.push({ name, ok, detail });
  if (!ok) process.exitCode = 1;
};

try {
  // Bare deps are externalised by Vite's SSR pipeline, so importing them here
  // yields the very same instances that /src/App.jsx will resolve.
  const React = (await import('react')).default;
  const { act } = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { MemoryRouter } = await import('react-router-dom');
  const { default: App } = await server.ssrLoadModule('/src/App.jsx');

  const container = document.getElementById('root');
  const root = createRoot(container);

  const flush = async (ms = 60) => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, ms));
    });
  };

  let mountSeq = 0;
  const render = async (initialPath) => {
    await act(async () => {
      root.render(
        React.createElement(
          MemoryRouter,
          { key: `${initialPath}#${++mountSeq}`, initialEntries: [initialPath] },
          React.createElement(App),
        ),
      );
    });
    await flush(420);
  };

  const text = () => document.body.textContent ?? '';
  const byTextIn = (root, label) =>
    Array.from((root ?? document).querySelectorAll('button, a')).find((el) =>
      (el.textContent ?? '').trim().toLowerCase().includes(label.toLowerCase()),
    );
  const byText = (label) => byTextIn(document, label);
  const count = (selector) => document.querySelectorAll(selector).length;
  const click = async (el, label) => {
    if (!el) throw new Error(`cannot click missing element: ${label}`);
    await act(async () => {
      el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await flush(420);
  };
  const setValue = async (el, value) => {
    const proto = el instanceof dom.window.HTMLTextAreaElement
      ? dom.window.HTMLTextAreaElement.prototype
      : el instanceof dom.window.HTMLSelectElement
        ? dom.window.HTMLSelectElement.prototype
        : dom.window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    await act(async () => {
      el.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      el.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    await flush(30);
  };

  /* --------------------------------------------------------- 1. routes */

  const ROUTES = [
    ['/', 'Your Perfect Event'],
    ['/vendors', 'Find your vendors'],
    ['/categories', 'Browse by category'],
    ['/wishlist', 'Your wishlist'],
    ['/bookings', 'My bookings'],
    ['/profile', 'Your profile'],
    ['/how-it-works', 'How it works'],
    ['/about', 'About One Ocean Events'],
    // The two demo dashboards (update spec §6, §13).
    ['/dashboard', 'Hello, Rahul'],
    ['/dashboard/messages', 'Your conversations with vendors'],
    ['/dashboard/settings', 'How this demo behaves in your browser'],
    ['/admin', 'Good morning, Admin'],
    ['/admin/customers', 'Everyone using the demo marketplace'],
    ['/admin/vendors', 'approval state'],
    ['/admin/reviews', 'waiting to be approved or hidden'],
    ['/admin/announcements', 'Notices sent to customers and vendors'],
    ['/admin/reports', 'how the demo marketplace is doing'],
    ['/no-such-page', '404'],
  ];

  for (const [path, needle] of ROUTES) {
    await render(path);
    check(`route ${path} renders`, text().includes(needle), `expected to find "${needle}"`);
  }

  /* ------------------------------------------------- 2. vendor listing */

  await render('/vendors');
  const cards = document.querySelectorAll('.vendor-card');
  check(
    'vendors page lists every vendor serving the default city',
    cards.length === 34,
    `found ${cards.length}`,
  );

  const sort = document.getElementById('vendors-sort');
  await setValue(sort, 'name');
  await flush(420);
  const firstName = document.querySelector('.vendor-name')?.textContent?.trim() ?? '';
  check('sort by name reorders results', firstName.startsWith('Aakriti'), `first card: ${firstName}`);

  /* --------------------------------------- 3. category filter + no match */

  await render('/vendors?q=xylophone');
  check(
    'a query with no matches shows an honest empty state',
    count('.vendor-card') === 0 && text().includes('No vendors match these filters'),
    `found ${count('.vendor-card')} cards`,
  );
  check(
    'empty state offers a way out rather than inventing vendors',
    text().includes('Try a different search term') && text().includes('Clear filters'),
    'expected the recovery copy and button',
  );

  await render('/vendors?category=catering-services');
  check(
    'catering filter narrows to the catering vendors only',
    count('.vendor-card') === 9,
    `found ${count('.vendor-card')}`,
  );
  check(
    'the category filter really is a filter, not the whole roster',
    count('.vendor-card') < cards.length,
    `catering ${count('.vendor-card')} vs all ${cards.length}`,
  );

  /* ------------------------------------------------------- 4. wishlist */

  await render('/wishlist');
  const seededSaves = count('.vendor-card');
  check(
    'the seeded wishlist is populated, not an empty shell',
    seededSaves > 0,
    'expected seeded saved vendors',
  );

  await render('/vendors');
  // Save the first vendor that is not already on the wishlist.
  const unsavedHeart = Array.from(document.querySelectorAll('.vendor-heart')).find(
    (el) => el.getAttribute('aria-pressed') !== 'true',
  );
  await click(unsavedHeart, 'wishlist heart');
  check('wishlist toast appears', text().includes('wishlist'), 'expected a wishlist toast');
  await render('/wishlist');
  check(
    'the newly saved vendor is added to the wishlist',
    count('.vendor-card') === seededSaves + 1,
    `found ${count('.vendor-card')}, expected ${seededSaves + 1}`,
  );

  /* -------------------------------------------------------- 5. compare */

  await render('/vendors');
  const compareButtons = Array.from(document.querySelectorAll('.vendor-actions .btn-secondary'));
  await click(compareButtons[0], 'compare 1');
  await click(compareButtons[1], 'compare 2');
  await click(compareButtons[2], 'compare 3');
  check('compare bar is visible', Boolean(document.querySelector('.compare-bar')), 'no compare bar');
  await click(compareButtons[3], 'compare 4 (over the limit)');
  check(
    'compare is capped at 3 with a warning',
    text().includes('up to 3 vendors'),
    'expected the max-compare warning',
  );
  await click(document.querySelector('.compare-bar .btn-primary'), 'open compare modal');
  check(
    'compare modal opens with 3 columns',
    document.querySelectorAll('.cmp-vendor-head').length === 3,
    `found ${document.querySelectorAll('.cmp-vendor-head').length}`,
  );
  check(
    'compare modal separates demo values from source facts',
    text().includes('Demo values'),
    'expected the demo band',
  );
  await act(async () => {
    document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
  await flush(200);
  check('Escape closes the modal', !document.querySelector('.modal-panel'), 'modal still open');

  /* -------------------------------------------------- 6. vendor profile */

  await render('/vendors');
  await click(byText('View Profile'), 'view profile');
  check('vendor modal opens', Boolean(document.querySelector('.vm')), 'no vendor modal');
  check(
    'vendor modal lists source facts unlabelled',
    text().includes('Events / scale') && text().includes('Specialty'),
    'expected the source-fact list',
  );
  check(
    'vendor modal never invents an unsupplied event count',
    !/Events \/ scale[\s\S]{0,40}undefined/.test(text()),
    'found an undefined scale value',
  );

  /* -------------------------------------------------------- 7. booking */

  await click(byTextIn(document.querySelector('.vm'), 'Book Now'), 'open booking');
  check('booking modal opens', Boolean(document.querySelector('.bk')), 'no booking modal');

  await click(byText('Send booking request'), 'submit empty booking');
  check(
    'empty booking form is rejected',
    text().includes('Choose your event date'),
    'expected validation errors',
  );

  const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  await setValue(document.getElementById('bk-date'), future);
  await setValue(document.getElementById('bk-type'), 'Wedding');
  await setValue(document.getElementById('bk-guests'), '250');
  await click(byText('Send booking request'), 'submit valid booking');
  // Anchored to the six-digit form the service generates: an open-ended
  // character class runs straight into the next text node.
  const reference = (text().match(/OOE-\d{6}/) ?? [])[0];
  check('booking confirmation shows a reference', Boolean(reference), 'expected a reference');

  /** Finds the booking card carrying a given reference, seeded or new. */
  const cardFor = (ref) =>
    Array.from(document.querySelectorAll('.booking-card')).find((el) =>
      (el.textContent ?? '').includes(ref),
    );

  await click(byText('Keep browsing'), 'close confirmation');
  await render('/bookings');
  check(
    'the new booking appears under My Bookings beside the seeded ones',
    Boolean(cardFor(reference)) && count('.booking-card') > 1,
    `${count('.booking-card')} cards, reference ${reference} ${cardFor(reference) ? 'found' : 'missing'}`,
  );

  // Cancel the booking this run created, not whichever card sorts first.
  await click(cardFor(reference)?.querySelector('.booking-cancel'), 'cancel booking');
  await flush(300);
  const cancelledTab = Array.from(document.querySelectorAll('[role="tab"]')).find((t) =>
    (t.textContent ?? '').includes('Cancelled'),
  );
  await click(cancelledTab, 'cancelled tab');
  check(
    'cancelled booking moves to the Cancelled tab',
    Boolean(cardFor(reference)),
    `reference ${reference} not in the cancelled tab`,
  );

  /* ----------------------------------------------------------- 8. chat */

  await render('/vendors');
  await click(byText('View Profile'), 'view profile');
  await click(byTextIn(document.querySelector('.vm'), 'Message'), 'open chat');
  check('chat modal opens seeded', document.querySelectorAll('.chat-msg').length >= 1, 'no seeded message');
  await setValue(document.getElementById('chat-input'), 'Are you free on the 12th?');
  await click(document.querySelector('.chat-send'), 'send message');
  check(
    'sent message appears',
    text().includes('Are you free on the 12th?'),
    'message not rendered',
  );
  await flush(1500);
  check(
    'vendor auto-reply arrives',
    document.querySelectorAll('.chat-msg-them').length >= 2,
    `found ${document.querySelectorAll('.chat-msg-them').length} vendor messages`,
  );

  /* ---------------------------------------------------------- 9. login */

  await render('/profile');
  await click(byText('Sign in'), 'open login');
  check('login modal opens', Boolean(document.querySelector('.login')), 'no login modal');
  check(
    'login modal has no password field',
    !document.querySelector('input[type="password"]'),
    'a password field would invite a real credential',
  );
  await setValue(document.getElementById('login-name'), 'Priya');
  await setValue(document.getElementById('login-email'), 'priya@example.com');
  await click(byText('Continue'), 'submit login');
  check('signed in state shows on the profile', text().includes('priya@example.com'), 'not signed in');

  /* -------------------------------------------------------- 10. search */

  await render('/vendors');
  const searchInput = document.querySelector('.search-input');
  await setValue(searchInput, 'flower');
  await act(async () => {
    searchInput.closest('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  });
  await flush(420);
  const flowerCards = count('.vendor-card');
  check(
    'search narrows to matching vendors',
    flowerCards > 0 && flowerCards < cards.length,
    `found ${flowerCards} of ${cards.length}`,
  );
  check(
    'every search result actually mentions the term',
    Array.from(document.querySelectorAll('.vendor-card')).every((el) =>
      (el.textContent ?? '').toLowerCase().includes('flower'),
    ),
    'a result did not match the query',
  );

  /* ----------------------------------------------------- 11. video modal */

  await render('/');
  await click(byText('Watch Our Story'), 'open video');
  check('video placeholder opens', text().includes('Film coming soon'), 'no video modal');

  /* -------------------------------------------- 12. admin record dialogs */

  /*
   * These three buttons shipped with no handler once. A probe found them, but
   * only because it reads React props directly — nothing here noticed, because
   * a dead button leaves the page exactly as it was. Asserting on the dialog
   * they open is what keeps them wired.
   */
  await render('/admin/customers');
  const custRow = document.querySelector('.dash-table tbody tr');
  const custName = custRow?.querySelector('.cell-strong')?.textContent?.trim();
  await click(byTextIn(custRow, 'View'), 'open customer record');
  check(
    'admin customer View opens the record dialog',
    Boolean(document.querySelector('.modal-panel')) && text().includes('Customer details'),
    'no customer dialog',
  );
  check(
    'the customer dialog shows that customer, not a blank template',
    Boolean(custName) && text().includes(custName),
    `expected ${custName} in the dialog`,
  );

  await render('/admin/customers');
  await click(byTextIn(document.querySelector('.dash-table tbody tr'), 'Edit'), 'open customer edit');
  const cityField = document.querySelector('#cm-location');
  check(
    'admin customer Edit opens an editable form',
    Boolean(document.querySelector('#cm-name')) && Boolean(cityField),
    'no customer edit form',
  );
  // Changing the city and saving must reach the table behind the dialog.
  await setValue(cityField, 'Chennai');
  await click(byText('Save changes'), 'save customer');
  check(
    'saving a customer edit updates the table behind the dialog',
    (document.querySelector('.dash-table tbody tr')?.textContent ?? '').includes('Chennai'),
    'the edited city did not reach the row',
  );

  await render('/admin/vendors');
  const vendorRow = document.querySelector('.dash-table tbody tr');
  await click(byTextIn(vendorRow, 'Edit'), 'open vendor edit');
  check(
    'admin vendor Edit opens the listing dialog',
    text().includes('Listing status'),
    'no vendor edit dialog',
  );
  check(
    'the vendor dialog keeps the supplied facts read-only',
    document.querySelectorAll('.ar-facts input, .ar-facts select').length === 0,
    'found an editable control among the source facts',
  );
  check(
    'the vendor dialog offers no Verified control',
    !/verified/i.test(
      document.querySelector('.ar-status-choice')?.textContent ?? '',
    ),
    'a verification toggle would claim a check that never happened',
  );

  /* ------------------------------------------------- 13. demo labelling */

  await render('/vendors');
  check(
    'every rating is paired with a demo tag',
    count('.stars') === count('.stars .demo-tag'),
    `${count('.stars')} ratings vs ${count('.stars .demo-tag')} tags`,
  );

  await render('/admin');
  check(
    'admin stats are labelled as demo numbers',
    /demo number/i.test(text()),
    'the invented head-line figures are unlabelled',
  );

  await render('/admin/reports');
  check(
    'reports say the charts are not measured from anything real',
    /demo figure/i.test(text()),
    'the charts are unlabelled',
  );

  await render('/admin/reviews');
  check(
    'the review queue does not present demo reviews as real feedback',
    /demo content|demo review/i.test(text()),
    'the review queue is unlabelled',
  );

  await render('/admin/vendors');
  check(
    'admin vendor rows separate supplied listings from sample ones',
    text().includes('Sample listing') && text().includes('Supplied listing'),
    'expected both provenance labels',
  );
  check(
    'a missing event count reads as unsupplied rather than as a guess',
    text().includes('Not supplied'),
    'expected "Not supplied" somewhere in the roster',
  );

  await render('/dashboard');
  check(
    'the client dashboard is populated, not a set of empty cards',
    !/\bNo data\b|Coming soon|Lorem ipsum/i.test(text()),
    'found placeholder filler copy',
  );
} catch (error) {
  check('smoke run completed', false, error?.stack ?? String(error));
} finally {
  await server.close();
}

/* -------------------------------------------------------------- report */

console.error = realError;
const failed = checks.filter((c) => !c.ok);
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${c.ok ? '' : ` — ${c.detail}`}`);

// React logs act() and key warnings through console.error; surface them.
const noise = problems.filter((p) => !p.includes('not wrapped in act'));
if (noise.length > 0) {
  console.log('\nConsole errors:');
  noise.slice(0, 12).forEach((p) => console.log(`  ${p.slice(0, 300)}`));
  process.exitCode = 1;
}

console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(process.exitCode ?? 0);
