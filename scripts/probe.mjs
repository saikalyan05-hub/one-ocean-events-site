import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

const server = await createServer({ server: { port: 5198, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--force-device-scale-factor=1'] });
const page = await browser.newPage();

await page.setViewport({ width: 1440, height: 950 });
await page.goto('http://localhost:5198/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 900));

const info = await page.evaluate(() => {
  const de = document.documentElement;
  const over = [];
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.right > de.clientWidth + 1) {
      const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      over.push({ sel: `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`, right: Math.round(r.right), pos: s.position, dec: el.closest('[aria-hidden="true"]') ? 1 : 0 });
    }
  }
  const drawer = document.getElementById('mobile-menu');
  const tr = document.querySelector('.carousel-track');
  window.scrollTo(99999, 0);
  const canScrollX = Math.round(window.scrollX);
  window.scrollTo(0, 0);
  const track = tr ? {
    overflowX: getComputedStyle(tr).overflowX,
    clientWidth: tr.clientWidth,
    scrollWidth: tr.scrollWidth,
    rectRight: Math.round(tr.getBoundingClientRect().right),
  } : null;
  return {
    clientWidth: de.clientWidth,
    scrollWidth: de.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    canScrollX,
    track,
    drawerDisplay: drawer ? getComputedStyle(drawer).display : 'missing',
    over: over.sort((a, b) => b.right - a.right).slice(0, 12),
  };
});
console.log(JSON.stringify(info, null, 1));

await page.screenshot({ path: 'qa-screenshots/_probe-hero-1440.png' });
await browser.close();
await server.close();
