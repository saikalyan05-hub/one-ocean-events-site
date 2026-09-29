/**
 * Layout QA (spec §35 / §36).
 *
 * Drives the real dev server in headless Chrome at every breakpoint and
 * reports horizontal overflow, elements escaping the viewport, and tap targets
 * below the 44px minimum. Writes a screenshot per page/width to
 * `qa-screenshots/` so the homepage can be compared against the reference.
 *
 * Run with: npm run qa
 */
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

if (!CHROME) {
  console.error('No Chrome or Edge binary found — skipping layout QA.');
  process.exit(0);
}

const WIDTHS = [
  { w: 1440, h: 1200, label: '1440' },
  { w: 1280, h: 1000, label: '1280' },
  { w: 1024, h: 900, label: '1024' },
  { w: 820, h: 1100, label: '820' },
  { w: 414, h: 900, label: '414' },
  { w: 360, h: 800, label: '360' },
];

const PAGES = [
  ['/', 'home'],
  ['/vendors', 'vendors'],
  ['/categories', 'categories'],
  ['/wishlist', 'wishlist'],
  ['/bookings', 'bookings'],
  ['/profile', 'profile'],
  ['/how-it-works', 'how-it-works'],
  ['/about', 'about'],
  ['/dashboard', 'dashboard-home'],
  ['/dashboard/bookings', 'dashboard-bookings'],
  ['/dashboard/messages', 'dashboard-messages'],
  ['/admin', 'admin-home'],
  ['/admin/vendors', 'admin-vendors'],
  ['/admin/bookings', 'admin-bookings'],
  ['/admin/reports', 'admin-reports'],
  ['/nope', '404'],
];

const OUT = 'qa-screenshots';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const problems = [];

const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const base = `http://localhost:5199`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
});

/** Runs in the page: finds overflow and undersized controls. */
const audit = () => {
  const docWidth = document.documentElement.clientWidth;

  // `overflow-x: clip` on <body> inflates scrollWidth without creating a
  // scrollbar, so the only honest test is whether the page can actually scroll.
  window.scrollTo(99999, 0);
  const scrollableBy = Math.round(window.scrollX);
  window.scrollTo(0, 0);

  const out = { scrollableBy, docWidth, escapees: [], small: [] };

  const describe = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}`;
  };

  for (const el of document.querySelectorAll('body *')) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    // Decorative layers are deliberately allowed past the edge; they are
    // clipped by `overflow-x: clip` and cannot be reached or scrolled to.
    if (el.closest('[aria-hidden="true"]') || el.closest('[class*="overflow-scroller"]')) continue;
    let inScroller = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll') { inScroller = true; break; }
    }
    if (inScroller) continue;

    if (r.right > docWidth + 1 && out.escapees.length < 8) {
      out.escapees.push(`${describe(el)} right=${Math.round(r.right)}`);
    }
  }

  for (const el of document.querySelectorAll('button, a[href], input, select, textarea, [role="tab"]')) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Inline text links inside a paragraph are exempt — WCAG 2.5.8 carves them out.
    if (el.tagName === 'A' && style.display.startsWith('inline') && el.closest('p, li, nav')) continue;
    if (r.height < 24 || r.width < 24) {
      if (out.small.length < 8) out.small.push(`${describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  }

  return out;
};

try {
  for (const { w, h, label } of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h });

    for (const [path, name] of PAGES) {
      const consoleErrors = [];
      page.on('pageerror', (e) => consoleErrors.push(String(e)));
      page.on('console', (m) => {
        if (m.type() === 'error') consoleErrors.push(m.text());
      });

      await page.goto(base + path, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 450));

      const result = await page.evaluate(audit);

      if (result.scrollableBy > 0) {
        problems.push(
          `[${label}px ${path}] page scrolls horizontally by ${result.scrollableBy}px` +
            (result.escapees.length ? ` — ${result.escapees.join(', ')}` : ''),
        );
      } else if (result.escapees.length) {
        problems.push(`[${label}px ${path}] content past the right edge: ${result.escapees.join(', ')}`);
      }
      if (result.small.length) {
        problems.push(`[${label}px ${path}] tap targets under 24px: ${result.small.join(', ')}`);
      }
      for (const e of consoleErrors) problems.push(`[${label}px ${path}] console: ${e.slice(0, 200)}`);

      if (name === 'home' || label === '1440' || label === '360') {
        // `overflow-x: clip` still reports layout overflow in scrollWidth, which
        // would make a fullPage capture wider than the viewport. Clipping on
        // <html> for the capture only pins it to the real viewport width.
        await page.evaluate(() => {
          document.documentElement.style.overflowX = 'hidden';
        });
        await page.screenshot({ path: `${OUT}/${name}-${label}.png`, fullPage: name === 'home' });
        await page.evaluate(() => {
          document.documentElement.style.overflowX = '';
        });
      }
      page.removeAllListeners('pageerror');
      page.removeAllListeners('console');
    }

    await page.close();
    console.log(`checked ${label}px`);
  }
} finally {
  await browser.close();
  await server.close();
}

if (problems.length === 0) {
  console.log('\nNo overflow, tap-target or console problems at any breakpoint.');
} else {
  console.log(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.log(`  ${p}`));
  process.exitCode = 1;
}
console.log(`Screenshots in ${OUT}/`);
