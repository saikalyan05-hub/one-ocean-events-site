/**
 * Horizontal-overflow + console-error audit.
 *
 * `document.documentElement.scrollWidth` is not a usable signal in this app:
 * `overflow-x: clip` on <body> leaves the un-clipped content width visible to
 * that property, so it reads ~10k on a healthy page. Instead this asks the only
 * question that matters to a visitor — can the page actually be scrolled
 * sideways? — and then attributes the overflow to elements that are NOT inside
 * a legitimate scroll container (the vendor carousel, table wrappers, …).
 *
 * Usage: node scripts/overflow.mjs <routes-csv, `_` = home> <width>
 */
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';

const routes = (process.argv[2] ?? '_').split(',').map((r) => (r === '_' ? '' : r));
const width = Number(process.argv[3] || 1440);

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

const server = await createServer({ server: { port: 5198, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width, height: 900 });

let failures = 0;

for (const route of routes) {
  const errors = [];
  const onConsole = (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 160));
  };
  const onPageError = (e) => errors.push('PAGEERROR ' + String(e).slice(0, 160));
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  await page.goto('http://localhost:5198/' + route, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));

  const res = await page.evaluate(() => {
    // Ground truth: does the viewport actually scroll sideways?
    const before = window.scrollX;
    window.scrollTo(500, window.scrollY);
    const canScroll = Math.round(window.scrollX) > 0;
    window.scrollTo(before, window.scrollY);

    const vw = document.documentElement.clientWidth;

    // An element only counts if no ancestor already clips or scrolls it.
    const isContained = (el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return true;
      }
      return false;
    };

    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right <= vw + 1 && r.left >= -1) continue;
      if (isContained(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed') continue; // fixed layers are painted, not scrolled
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.baseVal ?? el.className ?? '').toString().trim().slice(0, 54),
        left: Math.round(r.left),
        right: Math.round(r.right),
      });
    }
    out.sort((a, b) => b.right - a.right);
    return { canScroll, vw, offenders: out.slice(0, 10) };
  });

  const bad = res.canScroll || errors.length > 0;
  if (bad) failures += 1;
  console.log(`\n=== /${route} @${width}px === ${bad ? 'FAIL' : 'ok'}`);
  if (res.canScroll) console.log('  ! page scrolls horizontally');
  for (const o of res.offenders) console.log(`    ${o.tag}.${o.cls}  L${o.left} R${o.right}`);
  for (const e of [...new Set(errors)].slice(0, 6)) console.log(`  ! console: ${e}`);

  page.off('console', onConsole);
  page.off('pageerror', onPageError);
}

console.log(`\n${failures === 0 ? 'ALL CLEAN' : failures + ' route(s) with issues'}`);
await browser.close();
await server.close();
