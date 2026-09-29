/**
 * One-off stacking probe: opens the mobile filter drawer and reports where the
 * drawer, the compare tray and every stacking-context-forming ancestor sit.
 *
 * Usage: node scripts/zcheck.mjs
 */
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

const server = await createServer({ server: { port: 5195, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.goto('http://localhost:5195/vendors', { waitUntil: 'networkidle2' });
await page.click('.filter-trigger');
await new Promise((r) => setTimeout(r, 600));

const report = await page.evaluate(() => {
  const info = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { sel, z: cs.zIndex, pos: cs.position, rect: [r.x | 0, r.y | 0, r.width | 0, r.height | 0] };
  };
  const drawer = document.querySelector('.filter-drawer');
  const parents = [];
  for (let n = drawer?.parentElement; n && n !== document.documentElement; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (
      cs.zIndex !== 'auto' || cs.transform !== 'none' || cs.filter !== 'none' ||
      cs.isolation === 'isolate' || cs.willChange !== 'auto' || cs.contain !== 'none' ||
      cs.opacity !== '1' || cs.perspective !== 'none'
    ) {
      parents.push({ cls: n.className || n.tagName, z: cs.zIndex, pos: cs.position, transform: cs.transform, isolation: cs.isolation, contain: cs.contain, willChange: cs.willChange, opacity: cs.opacity });
    }
  }
  const hit = document.elementFromPoint(195, 780);
  return {
    drawer: info('.filter-drawer'),
    bar: info('.compare-bar'),
    barHeight: document.querySelector('.compare-bar')?.getBoundingClientRect().height | 0,
    topAt195x780: hit ? `${hit.tagName}.${hit.className}` : null,
    stackingAncestors: parents,
  };
});
console.log(JSON.stringify(report, null, 2));

await browser.close();
await server.close();
