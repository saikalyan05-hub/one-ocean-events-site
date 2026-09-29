/**
 * Dead-control probe.
 *
 * Finds buttons that look interactive but are wired to nothing. React stores
 * each element's props on the DOM node under a `__reactProps$…` key, so this
 * reads the handler directly rather than clicking and guessing from whether the
 * DOM changed — a button whose handler is a no-op and a button with no handler
 * at all are indistinguishable by that measure.
 *
 * A button is reported when it has no onClick, is not a form submit, and is not
 * disabled. Links are checked separately: an <a> with no href and no onClick
 * cannot be reached by keyboard either.
 *
 * Run with: npm run probe
 */
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

if (!CHROME) {
  console.error('No Chrome or Edge binary found — skipping click probe.');
  process.exit(0);
}

const PAGES = [
  '/',
  '/vendors',
  '/categories',
  '/wishlist',
  '/bookings',
  '/profile',
  '/how-it-works',
  '/about',
  '/dashboard',
  '/dashboard/wishlist',
  '/dashboard/compare',
  '/dashboard/bookings',
  '/dashboard/messages',
  '/dashboard/notifications',
  '/dashboard/profile',
  '/dashboard/settings',
  '/admin',
  '/admin/customers',
  '/admin/vendors',
  '/admin/bookings',
  '/admin/messages',
  '/admin/reviews',
  '/admin/announcements',
  '/admin/reports',
  '/admin/settings',
];

/*
 * Controls that only appear once something is open. Each entry opens the
 * surface first, so modal buttons are covered too — they are the easiest place
 * for a dead control to hide, because nothing on the page behind them changes.
 */
const FLOWS = [
  { path: '/vendors', open: '.vendor-card .btn-secondary', label: 'compare tray' },
  { path: '/vendors', open: '.vendor-actions .btn-primary', label: 'vendor modal' },
  { path: '/profile', open: '.empty-state .btn-primary, .profile-signout', label: 'profile action' },
  { path: '/admin/customers', open: '.cell-actions button', label: 'customer view' },
  { path: '/admin/customers', open: '.cell-actions button + button', label: 'customer edit' },
  { path: '/admin/vendors', open: '.cell-actions button + button', label: 'vendor edit' },
];

const server = await createServer({ server: { port: 5199 }, logLevel: 'error' });
await server.listen();
const base = 'http://localhost:5199';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
});

/** Runs in the page: returns every inert control it can see. */
const SCAN = () => {
  const propsOf = (el) => {
    const key = Object.keys(el).find((k) => k.startsWith('__reactProps$'));
    return key ? el[key] : null;
  };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const describe = (el) => {
    const cls =
      typeof el.className === 'string'
        ? el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
    const label = (el.getAttribute('aria-label') || el.textContent || '')
      .trim()
      .replace(/\s+/g, ' ');
    return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''} "${label.slice(0, 44)}"`;
  };

  const out = [];
  for (const el of document.querySelectorAll('button, a')) {
    if (!visible(el)) continue;
    const props = propsOf(el);
    if (!props) continue;

    if (el.tagName === 'BUTTON') {
      if (el.disabled) continue;
      if ((props.type ?? el.getAttribute('type')) === 'submit') continue;
      // A label wrapping an input, or a button inside a form, may delegate.
      if (props.onClick || props.onPointerDown || props.onMouseDown) continue;
      out.push(describe(el));
    } else if (!el.getAttribute('href') && !props.onClick) {
      out.push(`${describe(el)} (link with no href)`);
    }
  }
  return out;
};

const dead = new Map();
const errors = new Set();

const record = (path, items) => {
  for (const item of items) {
    const key = `${path}  ${item}`;
    dead.set(key, (dead.get(key) ?? 0) + 1);
  }
};

try {
  for (const path of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });
    page.on('pageerror', (e) => errors.add(`[${path}] ${String(e).slice(0, 180)}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.add(`[${path}] ${m.text().slice(0, 180)}`);
    });

    await page.goto(base + path, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));
    record(path, await page.evaluate(SCAN));
    await page.close();
  }

  for (const flow of FLOWS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });
    await page.goto(base + flow.path, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));
    const opened = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.click();
      return true;
    }, flow.open);
    if (!opened) {
      console.log(`  (flow "${flow.label}" found no ${flow.open} — skipped)`);
      await page.close();
      continue;
    }
    await new Promise((r) => setTimeout(r, 600));
    record(`${flow.path} → ${flow.label}`, await page.evaluate(SCAN));
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}

if (dead.size) {
  console.log(`\n${dead.size} inert control(s) — visible, enabled, wired to nothing:\n`);
  for (const [key, n] of dead) console.log(`  ${key}${n > 1 ? `  ×${n}` : ''}`);
} else {
  console.log('\nNo inert controls: every visible button has a handler.');
}

if (errors.size) {
  console.log(`\n${errors.size} console error(s):\n`);
  for (const e of [...errors].slice(0, 20)) console.log(`  ${e}`);
}

process.exit(dead.size || errors.size ? 1 : 0);
